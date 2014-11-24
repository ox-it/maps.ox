define(["app", "underscore", "backbone", "moxie.conf", "moxie.position", "places/models/POIModel", "places/views/CategoriesView", "places/views/SearchView", "places/views/DetailView", "places/collections/POICollection", "places/collections/CategoryCollection", "core/views/MapView", "core/media", "places/collections/AdditionalPOICollection", "places/collections/CustomCollection"], function(app, _, Backbone, conf, userPosition, POI, CategoriesView, SearchView, DetailView, POIs, Categories, MapView, media, AdditionalPOIs, CustomPOIs){

    // Points of Interest collections
    var pois = new POIs({
        excludeTypes: conf.excludeTypes,
        oxfordOnly: conf.oxfordOnly
    });
    var customPOIs = new CustomPOIs();

    function getPOI(poid) {
        var poi = false;
        poi = pois.get(poid);
        if (poi) {
            return poi;
        }
        poi = customPOIs.get(poid);
        return poi;
    }

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
        "": "home",
        "categories": "categories",
        "categories*category_name": "categories",
        "search": "search",
        "custom": "custom",
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

        custom: function(params) {

            console.log("Loading Custom View");

            params = params || {};
            var fullscreen = 'fullscreen' in params;
            // Special case for custom maps with 1 POI
            //
            // As the API has a different response for a single resource
            // we create the POI and call fetch on that rather than the
            // CustomPOIs collection.
            if (params.ids.split(',').length === 1) {
                var poi = new POI({id: params.ids});
                poi.on('sync', function() {
                    customPOIs.trigger('reset');  // Make sure the SearchView refreshes
                });
                customPOIs.reset([poi]);
                poi.fetch();
            } else {
                // Custom maps with multiple POIs
                customPOIs.ids = params.ids;
                customPOIs.fetch();
            }
            var layout = app.getLayout('MapBrowseLayout', {followUser: this.followUser});
            layout.removeDetail();
            if (fullscreen) {
                layout.removeBrowse();
            } else {
                layout.withBrowse();
            }

            // TODO this NEEDS to be revisited later
            // defaulting to university for now as this is expected
            // to be embedded for uni mainly...
            if ('type' in params) {
                var type = params.type;
            } else {
                var type = '/university';
            }

            var searchView = new SearchView({
                collection: customPOIs,
                followUser: this.followUser,
                type: type
            });
            layout.setView('.content-browse', searchView);
            var mapView = layout.getView('.content-map');
            // Remove any other mapClick listeners (if the view is being reused)
            mapView.off('mapClick');
            mapView.setCollection(customPOIs, additionalPOIs);
            searchView.render();
        },

        home: function(category_name) {
            this.displayCategories(category_name, true, true);
        },

        categories: function(category_name) {
            this.displayCategories(category_name, false, false);
        },

        displayCategories: function(category_name, reset_map, reset_detail) {
            // category_name seems to be passed as an empty string here on IE8
            if ((_.isUndefined(category_name) || category_name === '') && conf.defaultCategory) {
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

            if (reset_map === true) {
                mapView.defaultView();
            }
            if (reset_detail === true) {
                layout.removeDetail();
            }
        },

        search: function(params) {
            var query = params || {};
            var layout = app.getLayout('MapBrowseLayout', {followUser: this.followUser});
            layout.removeDetail();
            layout.withBrowse();

            // making sure no parameters are applied by default
            pois.options.browse_only_parameters = {};

            // TODO this might need to be revisited later once
            // there is a definitive decision
            if ('type' in params) {
                var type = params.type;
                // check if we have additional parameters for this type
                var category = categories.findWhere({type_prefixed: type});
                if (!query.q) {
                    // apply the parameters if there is no user query
                    // i.e. only when browsing
                    pois.options.browse_only_parameters = category.get('browse_only_parameters');
                }
            } else if ('university_only' in params) {
                var type = '/university';
            } else {
                var type = '/amenities';
            }

            if (!_.isEqual(query, pois.query) || (pois.length <= 1)) {
                // If the Collection has the correct query and we have items don't bother fetching new results now
                pois.query = query;
                // Calling reset here prevents us from rendering any old results
                pois.reset();
                pois.fetch();
            }


            var searchView = new SearchView({
                collection: pois,
                followUser: this.followUser,
                type: type
            });
            layout.setView('.content-browse', searchView);
            var mapView = layout.getView('.content-map');
            // Remove any other mapClick listeners (if the view is being reused)
            mapView.off('mapClick');
            mapView.setCollection(pois, additionalPOIs);
            searchView.render();
        },

        detailMap: function(id) {
            var poi = getPOI(id);
            if (!poi) {
                poi = new POI({id: id});
                poi.fetch();
            }
            this.showDetail(poi, false);
        },

        showDetail: function(poi, detailPane) {
            Backbone.off('places:navigate-detail');
            Backbone.off('places:navigate-map');
            Backbone.on('places:navigate-detail', function() {
                Backbone.history.navigate(
                    Backbone.history.reverse('detail', {id: poi.id}),
                    {trigger: true, replace: false}
                );
            });
            Backbone.on('places:navigate-map', function() {
                Backbone.history.navigate(
                    Backbone.history.reverse('detailMap', {id: poi.id}),
                    {trigger: true, replace: false}
                );
            });
            var layout = app.getLayout('MapBrowseLayout', {followUser: this.followUser});
            var browsePane = layout.hasBrowsePane();
            if (media.isPhone() || !browsePane) {
                layout.removeBrowse();
                if (!browsePane) {
                    var categoriesView = new CategoriesView({
                        collection: categories,
                        category_name: conf.defaultCategory,
                    });
                    layout.setView('.content-browse', categoriesView);
                    categoriesView.render();
                }
            }
            var mapView = layout.getView('.content-map');
            // Remove any other mapClick listeners (if the view is being reused)
            mapView.off('mapClick');
            mapView.setCollection(new POIs([poi]), additionalPOIs);
            if (detailPane) {
                if (media.isPhone()) {
                    mapView.disableInteractiveMap();
                    mapView.on('mapClick', function() {
                        Backbone.history.navigate(
                            Backbone.history.reverse('detailMap', {id: poi.id}),
                            {trigger: true, replace: false}
                        );
                    });
                }
                layout.withDetail();
                var detailView = new DetailView({
                    model: poi
                });
                layout.setView('.content-detail-wrapper', detailView);
                detailView.render();
            } else {
                mapView.enableInteractiveMap();
                layout.removeDetail({hidden: true});
            }
        },

        detail: function(id, params) {
            customPOIs.removeHighlighting();
            pois.removeHighlighting();
            var query = params || {};
            var showRTI = 'rti' in query ? params.rti : null;
            var poi = getPOI(id);
            if (poi) {
                poi.set({
                    showRTI: showRTI,
                    highlighted: true,
                });
            } else {
                poi = new POI({id: id, showRTI: showRTI});
                poi.fetch();
            }
            this.showDetail(poi, true);
        },

    };

    return PlacesRouter;
});
