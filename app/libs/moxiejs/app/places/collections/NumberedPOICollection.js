define(['underscore', 'places/collections/POICollection', 'places/models/NumberedPOIModel'], function(_, POICollection, NumberedPOI) {
    var NumberedPOICollection = POICollection.extend({
        initialize: function() {
            POICollection.prototype.initialize.apply(this, arguments);
            this.url = this.options.url;
            this.sortFunction = this.options.sortFunction;
        },
        numberOfMarkers: 0,
        parse: function(data) {
            if (data && data._embedded && data._embedded.pois) {
                var pois = _.filter(data._embedded.pois, function(poi) {
                    return poi.lat && poi.lon;
                });
                if (this.sortFunction) {
                    pois = _.sortBy(pois, this.sortFunction);
                }
                // Give POIs with the same lat/lon the same number for the map ref
                //
                // Numbering maps a {lat+lon} string to an Array of pois
                var numbering = {};
                var count = 0;
                _.each(pois, function(poi) {
                    var latlon = "" + poi.lat + poi.lon;
                    if (latlon in numbering) {
                        poi.number = numbering[latlon][0].number;
                        numbering[latlon].push(poi);
                    } else {
                        poi.number = count;
                        numbering[latlon] = [poi];
                        count++;
                    }
                    poi.markerText = (poi.number === 0) ? '<i class="fa fa-sign-in"></i>' : poi.number;
                });
                this.numberOfMarkers = _.size(numbering);
            }
            return POICollection.prototype.parse.apply(this, arguments);
        },
        model: NumberedPOI,
    });
    return NumberedPOICollection;
});
