define(["app", "underscore", "backbone", "places/models/POIModel", "places/views/CategoriesView", "places/views/SearchView", "places/views/DetailView", "places/collections/POICollection", "places/collections/CategoryCollection", "core/views/MapView", "core/media"], function(app, _, Backbone, POI, CategoriesView, SearchView, DetailView, POIs, Categories, MapView, media){

    var pois = new POIs();
    var categories = new Categories();
    categories.fetch();
    var PlacesRouter = {

        initialize: function(options) {
            options = options || {};
            this.followUser = options.followUser;
            this.urlPrefix = options.urlPrefix || '#places/';
        },

        // All of your Backbone Routes (add more)
        routes: {

            "": "categories",
            "categories": "categories",
            "categories*category_name": "categories",
            "search": "search",
            ":id": "detail",
            ":id/map": "detailMap"

        },

        categories: function(category_name) {
            // Navigate to the list of categories (root view of places)
            var categoriesView = new CategoriesView({
                collection: categories,
                category_name: category_name,
                urlPrefix: this.urlPrefix
            });
            var layout = app.getLayout('MapBrowseLayout', {followUser: this.followUser});
            layout.withBrowse();
            layout.setView('.content-browse', categoriesView);
            categoriesView.render();
        },

        search: function(params) {
            var query = params || {};
            if (!_.isEqual(query, pois.query) || (pois.length <= 1)) {
                // If the Collection has the correct query and we have items don't bother fetching new results now
                pois.query = query;
                // Calling reset here prevents us from rendering any old results
                pois.reset();
                pois.fetch();
            }
            var layout = app.getLayout('MapBrowseLayout', {followUser: this.followUser});
            layout.removeDetail();
            layout.withBrowse();
            var searchView = new SearchView({
                collection: pois,
                urlPrefix: this.urlPrefix,
                followUser: this.followUser
            });
            layout.setView('.content-browse', searchView);
            var mapView = layout.getView('.content-map');
            mapView.setCollection(pois);
            searchView.render();
        },

        detailMap: function(id) {
            var poi = pois.get(id);
            if (!poi) {
                poi = new POI({id: id});
                poi.fetch();
            }
            this.showDetail(poi, false, false);
        },

        showDetail: function(poi, browsePane, detailPane) {
            var layout = app.getLayout('MapBrowseLayout', {followUser: this.followUser});
            if (media.isPhone() || !browsePane) {
                layout.removeBrowse();
                if (!browsePane) {
                    var categoriesView = new CategoriesView({
                        collection: categories,
                        urlPrefix: this.urlPrefix
                    });
                    layout.setView('.content-browse', categoriesView);
                    categoriesView.render();
                }
            }
            var mapView = layout.getView('.content-map');
            mapView.setCollection(new POIs([poi]));
            if (detailPane) {
                layout.withDetail();
                var detailView = new DetailView({
                    model: poi
                });
                layout.setView('.content-detail', detailView);
                // Remove any other mapClick listeners (if the view is being reused)
                mapView.off('mapClick');
                var urlPrefix = this.urlPrefix;
                mapView.on('mapClick', function() {
                    Backbone.history.navigate(urlPrefix + poi.id + '/map', {trigger: true, replace: false});
                });
                detailView.render();
            }
        },

        detail: function(id, params) {
            var query = params || {};
            var showRTI = 'rti' in query ? params.rti : null;
            var poi = pois.get(id);
            var browsePane = false;
            if (poi) {
                poi.set('showRTI', showRTI);
                browsePane = true;
            } else {
                poi = new POI({id: id, showRTI: showRTI});
                poi.fetch();
            }
            this.showDetail(poi, browsePane, true);
        }
    };

    return PlacesRouter;
});
