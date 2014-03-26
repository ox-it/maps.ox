// Sets the require.js configuration for your application.
var moxieJS = 'libs/moxiejs/app/';
var moxiePlaces = ["places/models/POIModel", "places/views/CategoriesView", "places/views/SearchView", "places/views/DetailView", "places/collections/POICollection", "places/collections/AdditionalPOICollection", "places/collections/CategoryCollection", "places/models/RTIModels", "places/views/RTIViews", "places/utils", "places/views/ItemView", "places/models/CategoryModel", "places/templates/categories", "places/templates/search", "places/templates/detail", "places/templates/busrti", "places/templates/trainrti", "places/templates/p-r_rti", "places/templates/item", "places/templates/requesting_geolocation", "places/templates/error_geolocation"];
var moxieCore = ["core/views/MapView", "core/views/MapBrowseLayout", "core/views/InfiniteScrollView", "core/views/ErrorView", "core/collections/MoxieCollection", "core/media", "core/templates/map-browse", "core/templates/error"];
var require = {
    // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.7.2.min")
    baseUrl: './app',
    paths: {

        // Core Libraries
        "jquery": moxieJS + "libs/jquery",
        "underscore": moxieJS + "libs/underscore",
        "backbone": moxieJS + "libs/backbone",
        "handlebars": moxieJS + "libs/Handlebars",
        "hbs": moxieJS + "libs/hbs",
        "json2": moxieJS + "libs/json2",
        "i18nprecompile": moxieJS + "libs/i18nprecompile",
        "leaflet": moxieJS + "libs/leaflet",
        "leaflet.markercluster": moxieJS + "libs/leaflet.markercluster",
        "time_domain": moxieJS + "libs/time_domain",
        "fastclick": moxieJS + "libs/fastclick",
        "moment": moxieJS + "libs/moment",
        "backbone.queryparams": moxieJS + "libs/backbone.queryparams",
        "backbone.subroute": moxieJS + "libs/backbone.subroute",
        "backbone.layoutmanager": moxieJS + "libs/backbone.layoutmanager",
        "matchMedia": moxieJS + "libs/matchMedia",
        "raphael": moxieJS + "libs/raphael",
        "justgage": moxieJS + "libs/justgage",
        "wellknown": moxieJS + "libs/wellknown",
        "backbone.reverse": moxieJS + "libs/backbone.reverse",

        // Testing libs
        "jasmine": moxieJS + "tests/libs/jasmine-1.3.1/jasmine",
        "jasmine-html": moxieJS + "tests/libs/jasmine-1.3.1/jasmine-html",
        "jasmine-jquery": moxieJS + "tests/libs/jasmine-jquery",

        // Moxie Core modules
        "MoxieModel": moxieJS + "core/models/MoxieModel",
        "MoxieCollection": moxieJS + "core/collections/MoxieCollection",

        "moxie.conf": "maps.conf",
        "moxie.position": moxieJS + "moxie.position",
        "cordova.help": moxieJS + "cordova.help"
    },

    // Sets the configuration for your third party scripts that are not AMD compatible
    shim: {
        "backbone": {
            "deps": ["underscore", "jquery"],
            "exports": "Backbone"  //attaches "Backbone" to the window object
        },
        "underscore": {
            "exports": "_"
        },
        "backbone.queryparams": {
            "deps": ["backbone"]
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
        helperPathCallback: function(name) {return moxieJS + 'templates/helpers/' + name;}
    }
};
var moxieModules = moxiePlaces.concat(moxieCore);
for (var i = 0; i < moxieModules.length; i++) {
    require.paths[moxieModules[i]] = moxieJS + moxieModules[i];
}
