define(['underscore', 'moxie.conf', 'places/collections/POICollection'], function(_, conf, POIs) {
    var CustomPOIs = POIs.extend({
        url: function() {
            return conf.urlFor('places_id') + this.ids;
        },
    });
    return CustomPOIs;
});
