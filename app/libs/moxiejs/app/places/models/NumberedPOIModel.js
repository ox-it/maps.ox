define(['leaflet', 'places/models/POIModel'], function(L, POI) {
    var NumberedPOI = POI.extend({
        parse: function(data) {
            if (this.get('singlePOI')) {
                if ('lat' in data && 'lon' in data) {
                    data.number = 1;
                }
            }
            return data;
        },
        getMapFeature: function() {
            if (this.has('lat') && this.has('lon')) {
                var latlng = new L.LatLng(this.get('lat'), this.get('lon'));
                var icon = L.divIcon({
                    html: '<div><span>' + this.get('number') + '</span></div>', iconSize: new L.Point(30, 30),
                    className: 'numbered-marker',
                });
                return new L.marker(latlng, {icon: icon, title: this.get('name')});
            }
        },
    });
    return NumberedPOI;
});
