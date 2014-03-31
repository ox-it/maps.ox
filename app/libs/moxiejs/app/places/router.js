define(["app", "underscore", "backbone", "moxie.conf", "moxie.position", "places/models/POIModel", "places/views/CategoriesView", "places/views/SearchView", "places/views/DetailView", "places/collections/POICollection", "places/collections/CategoryCollection", "core/views/MapView", "core/media", "places/collections/AdditionalPOICollection"], function(app, _, Backbone, conf, userPosition, POI, CategoriesView, SearchView, DetailView, POIs, Categories, MapView, media, AdditionalPOIs){

    var pois = new POIs();
    var categories = new Categories();
    categories.fetch();

    // Certain layers (collections of POIs) can be toggled on and off.
    // We only place an icon on the map for these POIs and load them
    // through geoJSON (without hypermedia). This improves performance
    // on the server and allows bulk loading through Leaflet.
    //
    // These serve the purpose of bringing context to the map rather than being
    // the primary user goal. e.g. "I'm looking for X building, oh is there a
    // bus stop nearby?"
    var additionalPOIs = {};
    _.each(conf.additionalCollections, function(options, name) {
        additionalPOIs[name] = new AdditionalPOIs(options);
    });

    var POI_PREFIX = 'places/';
    var routes = {
        "": "categories",
        "categories": "categories",
        "categories*category_name": "categories",
        "search": "search",
    };
    routes[POI_PREFIX + ':id'] = 'detail';
    routes[POI_PREFIX + ':id/map'] = 'detailMap';

    var PlacesRouter = {

        initialize: function(options) {
            options = options || {};
            this.followUser = options.followUser;
            if (!this.followUser) {
                // Wait for the user to manually unpause
                userPosition.pauseWatching();
            }
        },

        routes: routes,

        categories: function(category_name) {
            if (_.isUndefined(category_name) && conf.defaultCategory) {
                category_name = conf.defaultCategory;
            }
            var layout = app.getLayout('MapBrowseLayout', {followUser: this.followUser});
            var mapView = layout.getView('.content-map');
            var visibleLayers = _.clone(mapView.visibleLayers);
            mapView.setCollection(new POIs(), additionalPOIs);
            // Navigate to the list of categories (root view of places)
            var categoriesView = new CategoriesView({
                collection: categories,
                category_name: category_name,
                visibleLayers: visibleLayers,
            });
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
                followUser: this.followUser
            });
            layout.setView('.content-browse', searchView);
            var mapView = layout.getView('.content-map');
            mapView.setCollection(pois, additionalPOIs);
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
                    });
                    layout.setView('.content-browse', categoriesView);
                    categoriesView.render();
                }
            }
            var mapView = layout.getView('.content-map');
            mapView.setCollection(new POIs([poi]), additionalPOIs);
            if (detailPane) {
                layout.withDetail();
                var detailView = new DetailView({
                    model: poi
                });
                layout.setView('.content-detail-wrapper', detailView);
                // Remove any other mapClick listeners (if the view is being reused)
                mapView.off('mapClick');
                mapView.on('mapClick', function() {
                    Backbone.history.navigate(
                        Backbone.history.reverse('detailMap', {id: poi.id}),
                        {trigger: true, replace: false}
                    );
                });
                detailView.render();
            }
        },

        detail: function(id, params) {
            var query = params || {};
            var showRTI = 'rti' in query ? params.rti : null;
            var poi = pois.get(id);
            if (poi) {
                poi.set('showRTI', showRTI);
            } else {
                poi = new POI({id: id, showRTI: showRTI});
                poi.fetch();
            }
            var browsePane = false;
            if (pois.length > 0) {
                browsePane = true;
            }
            this.showDetail(poi, browsePane, true);
        },

    };

    return PlacesRouter;
});
