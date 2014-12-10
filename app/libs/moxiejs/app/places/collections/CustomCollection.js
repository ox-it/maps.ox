define(['underscore', 'moxie.conf', 'places/collections/POICollection'], function(_, conf, POIs) {
    var CustomPOIs = POIs.extend({
        showInfo: true,
        url: function() {
            // the API response is different for one ID, adding a
            // comma makes it return a list
            return conf.urlFor('places_id') + this.ids + ",";
        },
    });
    return CustomPOIs;
});
