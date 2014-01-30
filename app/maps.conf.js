define([], function() {
    var MoxieConf = {
        endpoint: 'http://new.m.ox.ac.uk/api',
        paths: {
            places_search: '/places/search',
            places_categories: '/places/types',
            places_id: '/places/',
        },
        urlFor: function(api_method) {
            return this.endpoint + this.paths[api_method];
        },
        pathFor: function(api_method) {
            return this.paths[api_method];
        },
        defaultLocation: {coords: {latitude: 51.752018, longitude: -1.257723}},
        mapbox: {key: 'mobileox.h54gm7gg'},
        map: {
            defaultZoom: 15,
            bounds: {exponent: 0.75, limit: 500, fallback: 5},
            phoneViewMediaQuery: "only screen and (max-width: 767px)",
            defaultTileLayerOptions:  {
                minZoom: 0,
                maxZoom: 18,
                // Detect retina - if true 4* map tiles are downloaded
                detectRetina: true
            }
        },
        position: {
            updateInterval: 60000,          // 60 seconds
            errorMargin: 50,                // 50 meters
            accuracyTimeout: 25000,         // 25 seconds
            maximumAge: 600000,             // 10 minutes
            enableHighAccuracy: true,       // Use the GPS if possible
        },
    };
    return MoxieConf;
});
