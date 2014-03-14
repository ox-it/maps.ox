define(['backbone', 'underscore'], function(Backbone, _) {
    Backbone.history.reverse = function(name, params) {
        var possibleHandlers = _.where(Backbone.history.handlers, {name: name});
        var match;
        var url;
        _.find(possibleHandlers, function(handler) {
            url = '#/' + handler.oldRoute;
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
});
