define(['underscore', 'leaflet', 'places/collections/POICollection', 'places/models/POIModel'], function(_, L, POICollection, POI) {
    var NumberedPOI = POI.extend({
        getMapFeature: function() {
            if (this.has('lat') && this.has('lon')) {
                var latlng = new L.LatLng(this.get('lat'), this.get('lon'));
                var icon = L.divIcon({ html: '<div><span>' + this.get('number') + '</span></div>', iconSize: new L.Point(40, 40) });
                return new L.marker(latlng, {icon: icon, title: this.get('name')});
            }
        },
    });
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
