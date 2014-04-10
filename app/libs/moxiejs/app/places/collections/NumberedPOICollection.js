define(['underscore', 'places/collections/POICollection', 'places/models/NumberedPOIModel'], function(_, POICollection, NumberedPOI) {
    var NumberedPOICollection = POICollection.extend({
        initialize: function() {
            POICollection.prototype.initialize.apply(this, arguments);
            this.url = this.options.url;
        },
        parse: function(data) {
            if (data && data._embedded && data._embedded.pois) {
                var poisWithLocations = _.filter(data._embedded.pois, function(poi) {
                    return poi.lat && poi.lon;
                });
                _.each(poisWithLocations, function(poi, index) {
                    poi.number = index;
                });
            }
            return POICollection.prototype.parse.apply(this, arguments);
        },
        model: NumberedPOI,
    });
    return NumberedPOICollection;
});
