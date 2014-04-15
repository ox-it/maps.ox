// Sets the require.js configuration for your application.
var require = {
    // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
    baseUrl: './app',
    paths: {

        // Core Libraries
        "jquery": "libs/moxiejs/app/libs/jquery",
        "underscore": "libs/moxiejs/app/libs/underscore",
        "backbone": "libs/moxiejs/app/libs/backbone",
        "handlebars": "libs/moxiejs/app/libs/Handlebars",
        "hbs": "libs/moxiejs/app/libs/hbs",
        "json2": "libs/moxiejs/app/libs/json2",
        "i18nprecompile": "libs/moxiejs/app/libs/i18nprecompile",
        "leaflet": "libs/moxiejs/app/libs/leaflet",
        "leaflet.markercluster": "libs/moxiejs/app/libs/leaflet.markercluster",
        "time_domain": "libs/moxiejs/app/libs/time_domain",
        "fastclick": "libs/moxiejs/app/libs/fastclick",
        "moment": "libs/moxiejs/app/libs/moment",
        "backbone.queryparams": "libs/moxiejs/app/libs/backbone.queryparams",
        "backbone.subroute": "libs/moxiejs/app/libs/backbone.subroute",
        "backbone.layoutmanager": "libs/moxiejs/app/libs/backbone.layoutmanager",
        "matchMedia": "libs/moxiejs/app/libs/matchMedia",
        "raphael": "libs/moxiejs/app/libs/raphael",
        "justgage": "libs/moxiejs/app/libs/justgage",
        "wellknown": "libs/moxiejs/app/libs/wellknown",
        "backbone.reverse": "libs/moxiejs/app/libs/backbone.reverse",

        // Testing libs
        "jasmine": "libs/moxiejs/app/tests/libs/jasmine-1.3.1/jasmine",
        "jasmine-html": "libs/moxiejs/app/tests/libs/jasmine-1.3.1/jasmine-html",
        "jasmine-jquery": "libs/moxiejs/app/tests/libs/jasmine-jquery",

        "moxie.conf": "maps.conf",
        "moxie.position": "libs/moxiejs/app/moxie.position",
        "cordova.help": "libs/moxiejs/app/cordova.help",

        // Moxie Places
        "places/models/POIModel": "libs/moxiejs/app/places/models/POIModel",
        "places/models/NumberedPOIModel": "libs/moxiejs/app/places/models/NumberedPOIModel",
        "places/views/CategoriesView": "libs/moxiejs/app/places/views/CategoriesView",
        "places/views/SearchView": "libs/moxiejs/app/places/views/SearchView",
        "places/views/DetailView": "libs/moxiejs/app/places/views/DetailView",
        "places/collections/POICollection": "libs/moxiejs/app/places/collections/POICollection",
        "places/collections/NumberedPOICollection": "libs/moxiejs/app/places/collections/NumberedPOICollection",
        "places/collections/AdditionalPOICollection": "libs/moxiejs/app/places/collections/AdditionalPOICollection",
        "places/collections/CategoryCollection": "libs/moxiejs/app/places/collections/CategoryCollection",
        "places/models/RTIModels": "libs/moxiejs/app/places/models/RTIModels",
        "places/views/RTIViews": "libs/moxiejs/app/places/views/RTIViews",
        "places/utils": "libs/moxiejs/app/places/utils",
        "places/views/ItemView": "libs/moxiejs/app/places/views/ItemView",
        "places/models/CategoryModel": "libs/moxiejs/app/places/models/CategoryModel",
        "places/templates/categories": "libs/moxiejs/app/places/templates/categories",
        "places/templates/search": "libs/moxiejs/app/places/templates/search",
        "places/templates/detail": "libs/moxiejs/app/places/templates/detail",
        "places/templates/busrti": "libs/moxiejs/app/places/templates/busrti",
        "places/templates/trainrti": "libs/moxiejs/app/places/templates/trainrti",
        "places/templates/p-r_rti": "libs/moxiejs/app/places/templates/p-r_rti",
        "places/templates/item": "libs/moxiejs/app/places/templates/item",
        "places/templates/requesting_geolocation": "libs/moxiejs/app/places/templates/requesting_geolocation",
        "places/templates/error_geolocation": "libs/moxiejs/app/places/templates/error_geolocation",

        // Moxie Core modules
        "MoxieModel": "libs/moxiejs/app/core/models/MoxieModel",
        "MoxieCollection": "libs/moxiejs/app/core/collections/MoxieCollection",

        "core/views/MapView": "libs/moxiejs/app/core/views/MapView",
        "core/views/MapBrowseLayout": "libs/moxiejs/app/core/views/MapBrowseLayout",
        "core/views/InfiniteScrollView": "libs/moxiejs/app/core/views/InfiniteScrollView",
        "core/views/ErrorView": "libs/moxiejs/app/core/views/ErrorView",
        "core/collections/MoxieCollection": "libs/moxiejs/app/core/collections/MoxieCollection",
        "core/media": "libs/moxiejs/app/core/media",
        "core/templates/map-browse": "libs/moxiejs/app/core/templates/map-browse",
        "core/templates/error": "libs/moxiejs/app/core/templates/error",
    },

    // Sets the configuration for your third party scripts that are not AMD compatible
    shim: {
        "underscore": {
            "exports": "_"
        },
        "leaflet": {
            "exports": "L"
        },
        "leaflet.markercluster": {
            "deps": ["leaflet"],
        },
        "wellknown": {
            "exports": "parse"
        },
        "time_domain": {
            "exports": "TimeDomain"
        },
        "handlebars": {
            "exports": "Handlebars"
        },
        "json2": {
            "exports": "JSON"
        },
        "justgage": {
            "deps": ["raphael"],
            "exports": "justgage"
        },

        // Jasmine Unit Testing
        "jasmine": {
            "exports": "jasmine"
        },
        "jasmine-html": {
            "deps": ["jasmine"],
            "exports": "jasmine"
        },
        "jasmine-jquery": {
            "deps": ["jasmine"]
        }
    },

    hbs: {
        templateExtension: 'handlebars',
        disableI18n: true,
        helperPathCallback: function(name) {return 'libs/moxiejs/app/templates/helpers/' + name;}
    }
};
