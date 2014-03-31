define(["backbone", "core/collections/MoxieCollection", "underscore", "places/models/POIModel", "moxie.conf", 'moxie.position', 'leaflet'], function(Backbone, MoxieCollection, _, POI, conf, userPosition, L) {

    var POIs = MoxieCollection.extend({
        model: POI,

        initialize: function(options) {
            this.options = options || {};
            this.query = {};
        },

        followingPosition: false,

        followUser: function() {
            userPosition.follow(this.handle_geolocation_query, this);
            this.followingPosition = true;
        },

        unfollowUser: function() {
            userPosition.unfollow(this.handle_geolocation_query, this);
            this.followingPosition = false;
        },

        removeHighlighting: function(options) {
            var highlit = this.where({highlighted: true});
            _.each(highlit, function(model) {
                model.set({highlighted: false}, options);
            });
        },

        getBounds: function() {
            // Returns a L.LatLngBounds for the collection of POIs, follows this flow:
            //
            // if there are no POIs returns null.
            // if there is one POI with a [multi]polygon returns bounds on whole shape
            // if there are multiple POIs and location is disabled returns bounds of all POIs
            // if there are multiple POIs and location is enabled returns bounds of some nearby POIs
            //   > if there are no true nearby POIs following our algorithm, returns bounds of 5 nearest.
            var bounds = null;
            var latlngs = [];
            if (this.length===0) {
                return bounds;
            } else if (this.length===1 && this.at(0).has('shape')) {
                // bound by shape if possible
                var shape = this.at(0).getMapFeature();
                if (shape) { // getMapFeature can return undefined if fails parsing
                    bounds = shape.getBounds();
                }
            } else if (!userPosition.listening()) {
                this.each(function(poi) {
                    if (poi.hasLocation()) {
                        latlngs.push(new L.LatLng(poi.get('lat'), poi.get('lon')));
                    }
                });
            } else {
                this.each(function(poi) {
                    // See paramaters in moxie.conf
                    //
                    // Show just a few nearby results -- since we load quite a lot of resutlts by default
                    // the entire listing can be quite overwhelming and the map ends up being very zoomed out.
                    // This was ported verbatim from Molly.
                    if (poi.hasLocation() && (Math.pow((poi.get('distance')*1000), conf.map.bounds.exponent) * (latlngs.length + 1)) < conf.map.bounds.limit) {
                        latlngs.push(new L.LatLng(poi.get('lat'), poi.get('lon')));
                    }
                });
                if (latlngs.length === 0) {
                    _.each(this.first(conf.map.bounds.fallback), function(poi) {
                        if (poi.hasLocation()) {
                            latlngs.push(new L.LatLng(poi.get('lat'), poi.get('lon')));
                        }
                    });
                }
            }
            if (_.isNull(bounds) && latlngs.length > 0) {
                bounds = new L.LatLngBounds(latlngs);
            }
            return bounds;
        },

        latestUserPosition: null,
        geoFetch: function(options) {
            options = options || {};
            options.headers = options.headers || {};
            var position = this.latestUserPosition || userPosition.getCurrentLocation();
            if (position) {
                position = [position.coords.latitude, position.coords.longitude];
                options.headers['Geo-Position'] = position.join(';');
            }
            return MoxieCollection.prototype.fetch.call(this, options);
        },

        fetch: function() {
            // Set a boolean for while the fetch is inflight
            this.ongoingFetch = true;
            // Following user Position so send a Geo-Position header
            if (this.followingPosition) {
                return this.geoFetch.apply(this, arguments);
            } else {
                return MoxieCollection.prototype.fetch.apply(this, arguments);
            }
        },

        handle_geolocation_query: function(position) {
            if (this.latestUserPosition &&
                this.latestUserPosition.coords.latitude === position.coords.latitude &&
                this.latestUserPosition.coords.longitude === position.coords.longitude)
            {
                // User position hasn't changed, no need to fetch new results
                //
                // Especially useful for people browsing from Desktops
                return;
            }

            this.latestUserPosition = position;
            this.geoFetch();
        },

        fetchNextPage: function() {
            if (this.next_results) {
                var urlFunc = this.url;
                this.url = conf.endpoint + this.next_results.href;
                this.fetch({update: true, remove: false});
                this.url = urlFunc;
            } else {
                return false;
            }
        },

        parse: function(data) {
            if (this.followingPosition) {
                Backbone.trigger('showUser');
            }
            // Fetch over
            this.ongoingFetch = false;
            // Called when we want to empty the existing collection
            // For example when a search is issued and we clear the existing results.
            this.next_results = data._links['hl:next'];
            this.facets = data._links['hl:types'];
            return data._embedded.pois;
        },

        url: function() {
            var query = _.clone(this.query);
            if (this.options.defaultQuery && _.isEmpty(query)) {
                query = this.options.defaultQuery;
            }
            var qstring = $.param(query, true);
            var searchPath;
            if (this.options.format && this.options.format === conf.formats.geoJSON) {
                searchPath = conf.pathFor('places_search_geojson');
            } else {
                searchPath = conf.pathFor('places_search');
            }
            if (qstring) {
                searchPath += ('?' + qstring);
            }
            return conf.endpoint + searchPath.replace(/\+/g, "%20");
        }


    });

    // Returns the Model class
    return POIs;

});
