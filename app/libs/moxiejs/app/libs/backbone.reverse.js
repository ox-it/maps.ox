define(['backbone', 'underscore'], function(Backbone, _) {

    var ReversibleRouter = Backbone.Router.extend({
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

    Backbone.history.route = function(route, callback, name, routeStr) {
        this.handlers.unshift({route: route, callback: callback, name: name, routeStr: routeStr});
    };

    Backbone.history.reverse = function(name, params) {
        var possibleHandlers = _.where(Backbone.history.handlers, {name: name});
        var match;
        var url;
        _.find(possibleHandlers, function(handler) {
            url = '#/' + handler.routeStr;
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
            throw new Error("Couldn't find an approrpirate matching Route: "+ name);
        }
    };

    return ReversibleRouter;
});
