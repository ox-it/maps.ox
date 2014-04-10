define(['underscore', 'places/collections/POICollection', 'places/models/NumberedPOIModel'], function(_, POICollection, NumberedPOI) {
    var NumberedPOICollection = POICollection.extend({
        initialize: function() {
            POICollection.prototype.initialize.apply(this, arguments);
            this.url = this.options.url;
            this.sortFunction = this.options.sortFunction;
        },
        parse: function(data) {
            if (data && data._embedded && data._embedded.pois) {
                var pois = _.filter(data._embedded.pois, function(poi) {
                    return poi.lat && poi.lon;
                });
                if (this.sortFunction) {
                    pois = _.sortBy(pois, this.sortFunction);
                }
                _.each(pois, function(poi, index) {
                    poi.number = index + 1;
                });
            }
            return POICollection.prototype.parse.apply(this, arguments);
        },
        model: NumberedPOI,
    });
    return NumberedPOICollection;
});
