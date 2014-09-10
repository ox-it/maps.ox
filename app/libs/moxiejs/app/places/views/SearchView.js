define(['jquery', 'backbone', 'underscore', 'moxie.conf', 'places/views/ItemView', 'hbs!places/templates/search', 'core/views/InfiniteScrollView', 'moxie.position'],
    function($, Backbone, _, MoxieConf, ItemView, searchTemplate, InfiniteScrollView, userPosition){

    var SORT_AZ = 'az';
    var SORT_NEARBY = 'nearby';

    var SearchView = InfiniteScrollView.extend({

        // View constructor
        initialize: function(options) {
            _.bindAll(this);
            this.options = options;
            if (this.options.followUser) {
                this.collection.followUser();
            }
            userPosition.on('position:paused', function() {
                this.collection.latestUserPosition = null;
                this.collection.fetch();
            }, this);
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.addResult, this);

            this.sortOrder = options.sortOrder || SORT_AZ;
            this.topLevelCategory = this.options.type;
        },

        manage: true,

        // Event Handlers
        events: {
            'keypress :input[type="text"]': "searchKeypressEvent",
            'click :input[type="submit"]': "searchClickEvent",
            'click .deleteicon': "clearSearch",
            'change .type-exact input': "clickTypeFacet",
            'change .accessibility input': "clickAccessibilityFacet",
            'click .map-options .university': "university",
            'click .map-options .amenities': "amenities",
            'click .map-options .filter a': "filter",

            'click a.result-link': "clickResult",
        },

        clickResult: function(ev) {
            if ($('.map-browse-layout.with-detail').length===1) {
                // Silent browse, replace URL but don't write in history
                ev.preventDefault();
                Backbone.history.navigate(Backbone.history.reverse('detail', {id: ev.target.id} ), {trigger: true, replace: true});
                return false;
            } else {
                // Normal browse, write to history
                return true;
            }
        },

        filtering: false,
        filter: function(ev) {
            ev.preventDefault();
            this.filtering = !this.filtering;
            // Toggle the facet lists
            this.$('.filters').toggleClass('hide-filters');

            // Highlight the button
            this.$('.filter').toggleClass('highlighted');
            // Remove the border on the options
            this.$('.filter').parent().toggleClass('something-highlighted');
        },

        sortNearby: function(ev) {
            this.sortOrder = SORT_NEARBY;
            ev.preventDefault();
            this.collection.followUser();
            if (!userPosition.listening()) {
                userPosition.unpauseWatching();
            } else if (this.collection.latestUserPosition) {
                this.collection.fetch();
            }
        },

        sortAZ: function(ev) {
            this.sortOrder = SORT_AZ;
            ev.preventDefault();
            this.collection.unfollowUser();
            this.collection.fetch();
        },
        university: function(ev) {
            this.topLevelCategory = "/university";
            var term = this.$(':input[type="text"]').val();
            if (term !== "") {

                this.searchForTerm(term);
            } else {
                Backbone.history.navigate("#/categories/university");
            }
            return false;
        },
        amenities: function(ev) {
            this.topLevelCategory = "/amenities";
            var term = this.$(':input[type="text"]').val();
            if (term !== "" && this.collection.length == 0) {
                this.searchForTerm(term);
            } else {
                Backbone.history.navigate("#/categories/amenities");
            }
            return false;
        },

        clearSearch: function(e) {
            this.$('.search-input input').val('').focus();
        },

        parentFacets: null,
        clickTypeFacet: function(ev) {
            if (!this.parentFacets) {
                this.parentFacets = _.clone(this.collection.facets);
            }
            var type_exact = ev.target.name;
            var facet = _.findWhere(this.parentFacets.type_exact, {name: type_exact});
            if (ev.target.checked) {
                if (this.collection.query.type_exact) {
                    this.collection.query.type_exact.push(type_exact);
                } else {
                    this.collection.query.type_exact = [type_exact];
                }
                this.collection.fetch();
                facet.checked = true;
            } else {
                var index = _.indexOf(this.collection.query.type_exact, type_exact);
                if (this.collection.query.type_exact && index!==-1) {
                    this.collection.query.type_exact.splice(index, 1);
                    this.collection.fetch();
                }
                facet.checked = false;
            }
        },

        clickAccessibilityFacet: function(ev) {
            if (!this.parentFacets) {
                this.parentFacets = _.clone(this.collection.facets);
            }
            var name = ev.target.name;
            var value = ev.target.value;
            var facet = _.findWhere(this.parentFacets.accessibility, {name: name});
            if (ev.target.checked) {
                this.collection.query[name] = value;
                this.collection.fetch();
                facet.checked = true;
            } else {
                if (name in this.collection.query) {
                    delete this.collection.query[name];
                    this.collection.fetch();
                }
                facet.checked = false;
            }
        },

        searchClickEvent: function(ev) {
            var term = this.$(':input[type="text"]').val();
            this.searchForTerm(term);
        },
        searchKeypressEvent: function(ev) {
            if (ev.which === 13) {
                this.searchForTerm(ev.target.value);
            }
        },
        searchForTerm: function(term) {
            Backbone.history.navigate(Backbone.history.reverse('search')+'?'+$.param({q: term, type: this.topLevelCategory}).replace(/\+/g, "%20"), {trigger: true});
        },

        addResult: function(model) {
            var trackingUserPosition = userPosition.listening();
            var view = new ItemView({
                model: model,
                trackingUserPosition: trackingUserPosition,
                showInfo: this.collection.query.q || this.collection.showInfo,
            });
            this.insertView("ul.results-list", view);
            view.render();
        },

        template: searchTemplate,
        serialize: function() {
            var context = {
                query: this.collection.query,
                hasResults: Boolean(this.collection.length),
                midRequest: this.collection.ongoingFetch,
                sortAZ: this.sortOrder===SORT_AZ,
                sortNearby: this.sortOrder===SORT_NEARBY,
                filtering: this.filtering,
                facets: this.parentFacets || this.collection.facets,
                facetsExist: false,
                amenities: this.topLevelCategory.indexOf('/amenities') === 0,
                university: this.topLevelCategory.indexOf('/university') === 0,
            };
            if (!_.isEmpty(context.facets)) {
                context.facetsExist = true;
                context.singleFacetList = _.keys(context.facets).length === 1;
            }
            return context;
        },

        beforeRender: function() {
            Backbone.trigger('domchange:title', "Search for Places of Interest");
            if (this.collection.length) {
                var showInfo = this.collection.query.q || this.collection.showInfo;
                var trackingUserPosition = this.sortOrder===SORT_NEARBY;
                var views = [];
                this.collection.each(function(model) {
                    views.push(new ItemView({
                        model: model,
                        trackingUserPosition: trackingUserPosition,
                        showInfo: showInfo,
                    }));
                });
                this.insertViews({"ul.results-list": views});
            }
        },

        infiniteScrollConfigured: false,
        afterRender: function() {
            if (!this.infiniteScrollConfigured) {
                // this.el is no longer the el which scrolls so we need to pass the parentNode
                var options = {windowScroll: true, scrollElement: this.el.parentNode, scrollThreshold: 1};
                InfiniteScrollView.prototype.initScroll.apply(this, [options]);
                this.infiniteScrollConfigured = true;
            }
        },

        scrollCallbacks: [function() {
            this.collection.fetchNextPage();
        }],

        cleanup: function() {
            this.collection.unfollowUser();
            InfiniteScrollView.prototype.onClose.apply(this);
        }
    });

    // Returns the View class
    return SearchView;
});
