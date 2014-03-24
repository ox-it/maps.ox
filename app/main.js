require(['jquery', 'underscore', 'backbone', 'backbone.reverse', 'libs/moxiejs/app/places/router', 'fastclick', 'backbone.queryparams', 'backbone.layoutmanager'], function($, _, Backbone, ReversibleRouter, PlacesRouter, FastClick) {
    $(function() {
        // Initialse our router
        var Router = ReversibleRouter.extend(PlacesRouter);
        var router = new Router({urlPrefix: '#', followUser: false});

        // Default to requesting hal+json but fallback to json
        $.ajaxSetup({ headers: { 'Accept': 'application/hal+json;q=1.0, application/json;q=0.9, */*; q=0.01' } });

        // This kicks off the app -- discovering the hashchanges and calling routers
        Backbone.history.start();

        console.log(Backbone.history.reverse('detail', {id: 'oxpoints:53255'}));
        console.log(Backbone.history.reverse('categories', {category_name: '/university'}));
        console.log(Backbone.history.reverse('categories'));

        // Include FastClick, this removes a 300ms touch event delay
        var fc = new FastClick(document.body);
    });
});
