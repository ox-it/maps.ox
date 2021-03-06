define(['backbone', 'jquery', 'leaflet', 'underscore', 'moxie.conf', 'places/utils', 'core/media', 'moxie.position', 'leaflet.markercluster'], function(Backbone, $, L, _, conf, utils, media, userPosition) {
    var MapView = Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this);
            this.options = options || {};
            this.features = [];
            this.additionalLayers = {};
            Backbone.on('map:additional-collection', this.registerAdditionalCollection, this);
            Backbone.on('map:numbered-collection', this.registerNumberedCollection, this);
            Backbone.on('map:zoom-all-markers', this.setMapBounds, this);
        },

        attributes: {},
        manage: true,
        id: "map",

        // Used to stop us resetting the map location once the user
        // moves the map. Carefully reset when the collection is reset.
        mapMoved: false,

        enableInteractiveMap: function() {
            this.map.dragging.enable();
            this.map.touchZoom.enable();
            this.map.scrollWheelZoom.enable();
            this.map.doubleClickZoom.enable();
            this.map.boxZoom.enable();
        },

        disableInteractiveMap: function() {
            this.map.dragging.disable();
            this.map.touchZoom.disable();
            this.map.scrollWheelZoom.disable();
            this.map.doubleClickZoom.disable();
            this.map.boxZoom.disable();
        },

        beforeRender: function() {
            $('html').addClass('map');
            this.map = utils.getMap(this.el);
            // Need to add a separate zoomControl here after the map is created
            var zoomControl = new L.control.zoom({position: 'bottomright'});
            zoomControl.addTo(this.map);
            if (!this.interactiveMap) {
                // Note: This view can be reused for example when navigating from a POI
                // SearchView to a DetailView. In which case we need to remove any lingering
                // events so we don't end up with multiple event handlers.
                //
                // See this is handled by the controllers.
                this.map.on('click', function() {
                    this.trigger('mapClick');
                }, this);
            }
            return this;
        },

        afterRender: function() {
            if (this.options.fullScreen) {
                this.$el.addClass('full-screen');
            }
            this.invalidateMapSize();
            this.map.on('dragstart', function() {
                this.mapMoved = true;
            }, this);
            this.map.on('resize', function() {
                // resize when the window is resized, but also fixes
                // issue when using the embed map in a tabbed view see RT#2602338
                this.setMapBounds();
            }, this);
        },

        // Manage displaying the User marker
        //  - Add/Remove/Toggle
        showUser: false,
        addUserMarker: function() {
            this.showUser = true;
            var listening = userPosition.listening();
            if (listening && this.user_marker) {
                this.map.addLayer(this.user_marker);
                this.setMapBounds();
            } else if (!listening) {
                userPosition.unpauseWatching();
            }
        },
        removeUserMarker: function() {
            this.showUser = false;
            if (this.user_marker) {
                this.map.removeLayer(this.user_marker);
                this.setMapBounds();
            }
        },
        toggleUserMarker: function() {
            if (this.showUser) {
                this.removeUserMarker();
            } else {
                this.addUserMarker();
            }
        },

        setCollection: function(collection, additionalCollections) {
            this.mapMoved = false;
            this.unsetCollection();
            this.collection = collection;
            // Listening only to "sync" seems to capture all necessary map changes
            //
            // Add is used as we load additional results.
            this.collection.on("sync", this.resetMapContents, this);
            this.collection.on("add", this.placePOI, this);
            if (additionalCollections) {
                _.each(additionalCollections, this.registerAdditionalCollection, this);
            }
            this.resetMapContents();
        },

        numberedCollection: null,
        registerNumberedCollection: function(collection) {
            this.numberedCollection = collection;
            collection.each(this.placePOI, this);
        },

        visibleLayers: [],

        registerAdditionalCollection: function(collection, name) {
            collection.on("show", function(collection) {
                if (!this.additionalLayers[name]) {
                    var icon = collection.getIcon();
                    var clickable = collection.hasInfo || false;
                    var markers = new L.MarkerClusterGroup({
                        spiderfyOnMaxZoom: false,
                        showCoverageOnHover: false,
                        zoomToBoundsOnClick: clickable,
                        singleMarkerMode: true,
                        maxClusterRadius: 40,
                        disableClusteringAtZoom: 16,
                        iconCreateFunction: function(cluster) {
                            return icon;
                        },
                    });
                    if (clickable) {
                        markers.on('click', function (a) {
                            Backbone.history.navigate('#/places/'+a.layer.feature.id, {trigger: true, replace: false});
                        });
                    }
                    markers.addLayer(L.geoJson(collection.geoJSON, {
                        pointToLayer: function(geojson, latlng) {
                            return new L.Marker(latlng, {
                                clickable: clickable,
                            });
                        }
                    }));
                    if (_.indexOf(this.visibleLayers, name)===-1) {
                        this.additionalLayers[name] = markers;
                    }
                }
                this.visibleLayers.push(name);
                this.map.addLayer(this.additionalLayers[name]);
            }, this);
            collection.on("hide", function(collection) {
                if (this.additionalLayers[name]) {
                    this.map.removeLayer(this.additionalLayers[name]);
                    var index = this.visibleLayers.indexOf(name);
                    if (index!==-1) {
                        this.visibleLayers.splice(index, 1);
                    }
                }
            }, this);
        },

        unsetCollection: function() {
            this.numberedCollection = null;
            if (this.collection) {
                this.collection.off(null, null, this);
                this.collection = null;
            }
        },

        handle_geolocation_query: function(position) {
            // is this the first position being reported?
            var firstPosition = false;
            if (!this.user_position) {
                firstPosition = true;
            }
            // Only update the features if the user position changes (useful for desktops)
            if (this.user_position && this.user_position[0] === position.coords.latitude && this.user_position[1] === position.coords.longitude)  {
                return;
            }
            this.user_position = [position.coords.latitude, position.coords.longitude];
            var you = new L.LatLng(position.coords.latitude, position.coords.longitude);
            if (this.user_marker) {
                this.map.removeLayer(this.user_marker);
            }
            this.user_marker = L.circleMarker(you, {radius: 7, color: '#4891DC', opacity: 0.6, weight: 4, fillOpacity: 1});

            if (this.showUser) {
                this.map.addLayer(this.user_marker);

                // Generally we reset the MapBounds after each new location is
                // reported unless the user has interacted with the map in someway.
                //
                // The only exception being when it's the first user position to be
                // reported in which case we always reset the map to new bounds.
                if (firstPosition || !this.mapMoved) {
                    this.setMapBounds();
                }
            }

        },

        placePOI: function(poi) {
            var feature = poi.getMapFeature();
            if (feature) {
                if (this.options.fullScreen && this.interactiveMap) {
                    // Phone View
                    feature.on('click', function(ev) {
                        Backbone.history.navigate('#/places/'+poi.id, {trigger: true, replace: false});
                    });
                } else {
                    // Tablet View
                    feature.on('click', _.bind(function(ev) {
                        poi.set('scroll', true);
                        Backbone.history.navigate('#/places/'+poi.id, {trigger: true, replace: false});
                    }, this));
                }
                this.map.addLayer(feature);
                this.features.push(feature);
            }
        },

        invalidateMapSize: function() {
            this.map.invalidateSize();
            return this;
        },

        setMapBounds: function() {
            // Only set map bounds if we have a collection
            if (this.collection && this.collection.length > 0) {
                var bounds = this.collection.getBounds();
                if (this.numberedCollection) {
                    bounds.extend(this.numberedCollection.getBounds());
                }
                if (bounds) {
                    if (this.showUser && this.user_position) {
                        bounds.extend(this.user_position);
                    }
                    var padding = (this.collection.length > 1)? conf.map.bounds.collectionPadding : conf.map.bounds.poiPadding;
                    bounds = bounds.pad(padding);
                    // Animating here seemed to cause a problem when we call fitBounds several
                    // times during a quick succession, not sure if this is a bug with leaflet
                    // but setting animate: false seems to resolve things.
                    this.map.fitBounds(bounds, {animate: false});
                }
            } else if (this.showUser && this.user_position) {
                this.map.panTo(this.user_position);
            }
        },

        resetMapContents: function(ev){
            // Remove the existing map features
            _.each(this.features, function(marker) {
                this.map.removeLayer(marker);
            }, this);
            // Create new list of features from search results
            this.features = [];
            this.collection.each(this.placePOI, this);
            this.setMapBounds();
        },

        // reset the map lat/lon and zoom to the default from the configuration
        defaultView: function() {
            this.map.setView([conf.defaultLocation.coords.latitude, conf.defaultLocation.coords.longitude], conf.map.defaultZoom, true);
        },

        cleanup: function() {
            $('html').removeClass('map');
            this.unsetCollection();
        }
    });
    MapView.extend(Backbone.Events);
    return MapView;
});
