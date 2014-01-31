require(['jquery','backbone', 'libs/moxiejs/app/places/router', 'fastclick', 'backbone.queryparams', 'backbone.layoutmanager'], function($, Backbone, PlacesRouter, FastClick) {
    $(function() {
        // Initialse our router
        var Router = Backbone.Router.extend(PlacesRouter);
        var router = new Router({urlPrefix: '#'});

        // Default to requesting hal+json but fallback to json
        $.ajaxSetup({ headers: { 'Accept': 'application/hal+json;q=1.0, application/json;q=0.9, */*; q=0.01' } });

        // This kicks off the app -- discovering the hashchanges and calling routers
        Backbone.history.start();

        // Include FastClick, this removes a 300ms touch event delay
        var fc = new FastClick(document.body);
    });
});
