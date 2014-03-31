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
        },

        manage: true,

        // Event Handlers
        events: {
            'keypress :input': "searchEvent",
            'click .deleteicon': "clearSearch",
            'change .filters input': "clickFacet",
            'click .map-options .sort-nearby': "sortNearby",
            'click .map-options .sort-az': "sortAZ",
            'click .map-options .filter': "filter",
        },

        filtering: false,
        filter: function(ev) {
            ev.preventDefault();
            this.$('.filters').toggleClass('hide-filters');
            this.filtering = !this.filtering;
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

        clearSearch: function(e) {
            this.$('.search-input input').val('').focus();
        },

        parentFacets: null,
        clickFacet: function(ev) {
            if (!this.parentFacets) {
                this.parentFacets = _.clone(this.collection.facets);
            }
            var type_exact = ev.target.name;
            var facet = _.findWhere(this.parentFacets, {name: type_exact});
            if (ev.target.checked) {
                if (this.collection.query.type_exact) {
                    this.collection.query.type_exact.push(type_exact);
                } else {
                    this.collection.query.type_exact = [type_exact];
                }
                this.collection.fetch();
                facet.checked = true;
            } else {
                var index = this.collection.query.type_exact.indexOf(type_exact);
                if (this.collection.query.type_exact && index!==-1) {
                    this.collection.query.type_exact.splice(index, 1);
                    this.collection.fetch();
                }
                facet.checked = false;
            }
        },

        searchEvent: function(ev) {
            if (ev.which === 13) {
                this.parentFacets = null;
                this.collection.query.q = ev.target.value;
                // User entered searches clear any existing facets
                // and query the entire index
                delete this.collection.query.type;
                delete this.collection.query.type_exact;
                this.collection.geoFetch();
                Backbone.history.navigate(Backbone.history.reverse('search')+'?'+$.param(this.collection.query).replace(/\+/g, "%20"), {trigger: false});
            }
        },

        addResult: function(model) {
            var trackingUserPosition = userPosition.listening();
            var view = new ItemView({
                model: model,
                trackingUserPosition: trackingUserPosition,
                userSearch: this.collection.query.q,
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
            };
            return context;
        },

        beforeRender: function() {
            Backbone.trigger('domchange:title', "Search for Places of Interest");
            if (this.collection.length) {
                var userSearch = this.collection.query.q;
                var trackingUserPosition = this.sortOrder===SORT_NEARBY;
                var views = [];
                this.collection.each(function(model) {
                    views.push(new ItemView({
                        model: model,
                        trackingUserPosition: trackingUserPosition,
                        userSearch: userSearch,
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
