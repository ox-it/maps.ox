define([], function() {

    var DEFAULT_LOCATION = {latitude: 51.752018, longitude: -1.257723};
    var GEOJSON = 'geoJSON';
    var MoxieConf = {
        endpoint: 'http://api.m.ox.ac.uk',
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
        defaultResultCount: 50,
        defaultLocation: {coords: DEFAULT_LOCATION},
        mapbox: {key: 'mobileox.4xjkbj4i'},
        map: {
            defaultZoom: 15,
            options: {
                zoomControl: false,
                minZoom: 5,
                maxZoom: 18,
            },
            primaryLayer: {
                path: 'http://maps-tiles.oucs.ox.ac.uk/{z}/{x}/{y}.png',
                bounds: [[51.6299, -1.4207], [51.8646, -1.1144]],
                options: {
                    maxZoom: 18,
                    minZoom: 12,
                    zIndex: 200,
                }
            },
            secondaryLayer: {
                path: 'https://{s}.tiles.mapbox.com/v3/mobileox.h54gm7gg/{z}/{x}/{y}.png',
                options: {
                    maxZoom: 18,
                    zIndex: 100,
                }
            },
            bounds: {
                exponent: 0.75,
                limit: 500,
                fallback: 5,
                collectionPadding: 0.1,
                poiPadding: 0.6,
            },
            phoneViewMediaQuery: "only screen and (max-width: 767px)",
        },
        position: {
            updateInterval: 600000,         // 10 minutes
            errorMargin: 150,               // 150 meters
            accuracyTimeout: 25000,         // 25 seconds
            maximumAge: 600000,             // 10 minutes
            enableHighAccuracy: true,       // Use the GPS if possible
        },
        defaultCategory: "/university",
        excludeTypes: ['/university/sub-library'],
        oxfordOnly: true,      // only search POIs in oxford
        categories: {
            "types": [
                {
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
                            "type_name_plural": "Libraries",
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
                {
                    "description": "ATMs, Restaurants, Post boxes, Recycling, Health...",
                    "type": "amenities",
                    "type_name": "Amenity",
                    "type_name_plural": "Amenities",
                    "type_prefixed": "/amenities",
                    "types": [
                        {
                            "type": "cafe",
                            "type_name": "Caf\u00e9",
                            "type_name_plural": "Caf\u00e9s",
                            "type_prefixed": "/amenities/food-drink/cafe",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/cafe-18.png',
                                clickable: true
                            },
                            hasInfo: true
                        },
                        {
                            "type": "restaurant",
                            "type_name": "Restaurant",
                            "type_name_plural": "Restaurants",
                            "type_prefixed": "/amenities/food-drink/restaurant",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/restaurant-18.png',
                                clickable: true
                            },
                            hasInfo: true
                        },
                        {
                            "type": "pub",
                            "type_name": "Pub",
                            "type_name_plural": "Pubs",
                            "type_prefixed": "/amenities/food-drink/pub",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/beer-18.png',
                                clickable: true
                            },
                            hasInfo: true
                        },
                        {
                            "type": "bar",
                            "type_name": "Bar",
                            "type_name_plural": "Bars",
                            "type_prefixed": "/amenities/food-drink/bar",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/bar-18.png',
                                clickable: true
                            },
                            hasInfo: true
                        },
                        {
                            "type": "atm",
                            "type_name": "ATM",
                            "type_name_plural": "ATMs",
                            "type_prefixed": "/amenities/atm",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/bank-18.png',
                                clickable: true
                            },
                            hasInfo: true
                        },
                        {
                            "type": "parking",
                            "type_name": "Parking",
                            "type_name_plural": "Parking",
                            "type_prefixed": "/transport/car-park",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/car-18.png',
                                clickable: true
                            },
                            defaultQuery: {
                                type: '/transport/car-park',
                                count: 100,
                                lat: DEFAULT_LOCATION.latitude,
                                lon: DEFAULT_LOCATION.longitude,
                            },
                            hasInfo: true
                        },
                        {
                            "type": "public-transport",
                            "type_name": "Public Transport",
                            "type_name_plural": "Public Transport",
                            "type_prefixed": "/transport/bus-stop",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/bus-18.png',
                                clickable: true
                            },
                             defaultQuery: {
                                type_exact: ['/transport/rail-station', '/transport/bus-stop'],
                                count: 200,
                                lat: DEFAULT_LOCATION.latitude,
                                lon: DEFAULT_LOCATION.longitude,
                            },
                            hasInfo: true
                        },
                        {
                            "type": "bicycle-parking",
                            "type_name": "Bicycle Parking",
                            "type_name_plural": "Bicycle Parking",
                            "type_prefixed": "/transport/bicycle-parking",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/bicycle-18.png',
                            },
                            defaultQuery: {
                                type_exact: '/transport/bicycle-parking',
                                count: 200,
                                lat: DEFAULT_LOCATION.latitude,
                                lon: DEFAULT_LOCATION.longitude,
                            },

                        },
                        {
                            "type": "post",
                            "type_name": "Post",
                            "type_name_plural": "Post",
                            "type_prefixed": "/amenities/post",
                            "types": [
                                {
                                    "type": "post-office",
                                    "type_name": "Post office",
                                    "type_name_plural": "Post offices",
                                    "type_prefixed": "/amenities/post/post-office"
                                },
                                {
                                    "type": "post-box",
                                    "type_name": "Post box",
                                    "type_name_plural": "Post boxes",
                                    "type_prefixed": "/amenities/post/post-box"
                                }
                            ],
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/post-18.png',
                            },
                        },
                        {
                            "type": "recycling-facility",
                            "type_name": "Recycling",
                            "type_name_plural": "Recycling",
                            "type_prefixed": "/amenities/recycling-facility",
                            "toggle": true,
                            icon: {
                                iconSize: [18, 18],
                                iconUrl: 'maki/renders/waste-basket-18.png',
                            }
                        }
                    ]
                }
            ]
        },
        formats: {
            geoJSON: GEOJSON,
        },
        additionalCollections: {
        }
    };
    return MoxieConf;
});
