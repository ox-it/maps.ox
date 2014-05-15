// Include all backbone plugins here then they don't need to appear in all our subrouters
require(['jquery', 'underscore', 'backbone', 'backbone.layoutmanager', 'backbone.queryparams', 'backbone.reverse', 'libs/moxiejs/app/places/router', 'fastclick'], function($, _, Backbone, Layout, bbqp, ReversibleRouter, PlacesRouter, FastClick) {
    $(function() {
        // Initialse our router
        var Router = ReversibleRouter.extend(PlacesRouter);
        var router = new Router({followUser: false});

        // Default to requesting hal+json but fallback to json
        $.ajaxSetup({ headers: { 'Accept': 'application/hal+json;q=1.0, application/json;q=0.9, */*; q=0.01' } });

        // This kicks off the app -- discovering the hashchanges and calling routers
        // Route is set to '#', Backbone updates this to '/#/'
        // Then we can use the root to prefix our URLs
        Backbone.history.start({root: '/'});

        // Include FastClick, this removes a 300ms touch event delay
        var fc = new FastClick(document.body);
    });
});
