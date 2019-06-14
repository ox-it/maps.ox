define([], function() {

    var DEFAULT_LOCATION = {latitude: 51.752018, longitude: -1.257723};
    var GEOJSON = 'geoJSON';
    var MoxieConf = {
        endpoint: '//maps.ox.ac.uk/api',
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
                path: 'https://maps-tiles.oucs.ox.ac.uk/{z}/{x}/{y}.png',
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
        excludeTypes: ['/university/sub-library', '/university/room'],
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
                            "type": "hall",
                            "type_name": "Hall",
                            "type_name_plural": "Halls",
                            "type_prefixed": "/university/hall"
                        },
                        {
                            "type": "department",
                            "type_name": "Department",
                            "type_name_plural": "Departments",
                            "type_prefixed": "/university/department",
                            "browse_only_parameters": {
                                "is_display_in_maps_department_list": true
                            }
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
                            "type_prefixed": "/university/museum"
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
                                iconUrl: 'maki/icons/cafe-15.svg',
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
                                iconUrl: 'maki/icons/restaurant-15.svg',
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
                                iconUrl: 'maki/icons/beer-15.svg',
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
                                iconUrl: 'maki/icons/bar-15.svg',
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
                                iconUrl: 'maki/icons/bank-15.svg',
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
                                iconUrl: 'maki/icons/car-15.svg',
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
                                iconUrl: 'maki/icons/bus-15.svg',
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
                                iconUrl: 'maki/icons/bicycle-15.svg',
                            },
                            defaultQuery: {
                                type_exact: '/transport/bicycle-parking',
                                count: 200,
                                lat: DEFAULT_LOCATION.latitude,
                                lon: DEFAULT_LOCATION.longitude,
                            },

                        },
                        {
                            "type": "defibrillator",
                            "type_name": "Defibrillator",
                            "type_name_plural": "Defibrillators",
                            "type_prefixed": "/amenities/health/defibrillator",
                            "toggle": true,
                            icon: {
                                iconSize: [18,18],
                                iconUrl: 'maki/icons/defibrillator-15.svg'
                            },
                            defaultQuery: {
                                type_exact: '/amenities/health/defibrillator',
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
                                iconUrl: 'maki/icons/post-15.svg',
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
                                iconUrl: 'maki/icons/waste-basket-15.svg',
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
