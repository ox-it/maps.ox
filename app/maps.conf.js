define([], function() {
    var MoxieConf = {
        endpoint: 'http://new.m.ox.ac.uk/api',
        paths: {
            places_search: '/places/search',
            places_search_geojson: '/places/search.geojson',
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
        mapbox: {key: 'mobileox.4xjkbj4i'},
        map: {
            defaultZoom: 15,
            bounds: {
                exponent: 0.75,
                limit: 500,
                fallback: 5,
                padding: 0.1
            },
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
        categories: {
            "description": "Libraries, Colleges, Departments...",
            "type": "university",
            "type_name": "University",
            "type_name_plural": "University",
            "type_prefixed": "/university",
            "types": [
                {
                    "type": "college",
                    "type_name": "College",
                    "type_name_plural": "Colleges",
                    "type_prefixed": "/university/college"
                },
                {
                    "type": "department",
                    "type_name": "Department",
                    "type_name_plural": "Departments",
                    "type_prefixed": "/university/department"
                },
                {
                    "type": "library",
                    "type_name": "Library",
                    "type_name_plural": "Librairies",
                    "type_prefixed": "/university/library"
                },
                {
                    "type": "museum",
                    "type_name": "Museum",
                    "type_name_plural": "Museums",
                    "type_prefixed": "/leisure/museum"
                },
                {
                    "type": "building",
                    "type_name": "Building",
                    "type_name_plural": "Buildings",
                    "type_prefixed": "/university/building"
                },
                {
                    "type": "hall",
                    "type_name": "Hall",
                    "type_name_plural": "Halls",
                    "type_prefixed": "/university/hall"
                }
            ]
        },
    };
    return MoxieConf;
});
