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
            'click .facet-list > li[data-category]': "clickFacet",

            'click .map-options .sort-nearby': "sortNearby",
            'click .map-options .sort-az': "sortAZ",
        },

        sortNearby: function(ev) {
            Backbone.trigger('showUser');
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

        clickFacet: function(e) {
            e.preventDefault();
            this.collection.query.type = $(e.target).data('category');
            this.collection.geoFetch();
            Backbone.history.navigate(Backbone.history.reverse('search')+'?'+$.param(this.collection.query).replace(/\+/g, "%20"), {trigger: false});
        },

        searchEvent: function(ev) {
            if (ev.which === 13) {
                this.collection.query.q = ev.target.value;
                // User entered searches clear any existing facets
                // and query the entire index
                delete this.collection.query.type;
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
                facets: [],
                hasResults: Boolean(this.collection.length),
                midRequest: this.collection.ongoingFetch,
                sortAZ: this.sortOrder===SORT_AZ,
                sortNearby: this.sortOrder===SORT_NEARBY,
            };
            if (this.collection.facets && (this.collection.query.q || this.collection.query.type) && this.collection.facets.length > 1) {
                context.facets = this.collection.facets;
            }
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
