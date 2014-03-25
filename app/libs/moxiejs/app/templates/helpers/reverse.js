define(["handlebars", "backbone"], function(Handlebars, Backbone) {
    function reverse(name) {
        var params = {};
        var args = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
        for (var i = 0; i < args.length; i += 2) {
            params[args[i]] = args[i+1];
        }
        try {
            return Backbone.history.reverse(name, params);
        } catch(e) {
            // No matching URL found.
            return null;
        }
    }
    Handlebars.registerHelper('reverse', reverse);
    return reverse;
});
