define(['backbone', 'underscore'], function(Backbone, _) {
    // NOTE - Monkey patching
    //
    // When Backbone.js is included it instantiates the Backbone.history object
    // Although Backbone.history is just a Router it includes a specialised
    // `route` function which prepends an array of URL handlers. We do the same
    // here but also attach the name of the route (function name) and the path
    // of the route in Backbone's simplified regex syntax.
    Backbone.history.route = function(route, callback, name, routeStr) {
        this.handlers.unshift({route: route, callback: callback, name: name, routeStr: routeStr});
    };

    Backbone.history.reverse = function(name, params, options) {
        // Find a route given the name and a set of paramaters.
        //
        // If no perfect match can be found (using all the params). Then we
        // raise an Error. Works for Backbone style routes (not regex).
        //
        // Examples:
        //    With the following routes:
        //         {
        //             'places/:id': 'detail',
        //             'categories*category_name': 'categories',
        //         }
        //
        //    reverse('detail', {id: 'oxpoints:53255'}));
        //    > '#places/oxpoints:53255
        //
        //    reverse('categories', {category_name: '/university/colleges'}));
        //    > '#categories/university/colleges'
        var possibleHandlers = _.where(Backbone.history.handlers, {name: name});
        var match;
        var url;
        options = options || {};
        var prefix = options.prefix || '';
        _.find(possibleHandlers, function(handler) {
            url = prefix + Backbone.history.root + handler.routeStr;
            match = true;
            _.each(params, function(val, key) {
                if (url.indexOf(':'+key)===-1 && url.indexOf('*'+key)===-1) {
                    match = false;
                }
            });
            if (match) {
                _.each(params, function(val, key) {
                    url = url.replace(':'+key, val).replace('*'+key, val);
                });
                // Break
                return true;
            }
        });
        if (match) {
            return url;
        } else {
            throw new Error("Couldn't find an appropriate matching Route: "+ name);
        }
    };

    var ReversibleRouter = Backbone.Router.extend({
        // Backbone.Router where `route` has been overriden to provide
        // additional detail to the central URL handlers. This allows us to
        // reverse a URL given a name and set of arguments.
        route: function(route, name, callback) {
            var routeStr = route;
            if (!_.isRegExp(route)) route = this._routeToRegExp(route);
            if (_.isFunction(name)) {
                callback = name;
                name = '';
            }
            if (!callback) callback = this[name];
            var router = this;
            Backbone.history.route(route, function(fragment) {
                var args = router._extractParameters(route, fragment);
                router.execute(callback, args);
                router.trigger.apply(router, ['route:' + name].concat(args));
                router.trigger('route', name, args);
                Backbone.history.trigger('route', router, name, args);
            }, name, routeStr);
            return this;
        }
    });
    return ReversibleRouter;
});
