define(["MoxieModel", "underscore", "moxie.conf", "places/models/RTIModels", "places/views/RTIViews", "leaflet", "wellknown"], function(MoxieModel, _, conf, RTIModels, RTIViews, L, wellknown) {

    var DEFAULT_RTI_TYPES = ['bus', 'rail-departures', 'p-r'];
    var POI = MoxieModel.extend({
        defaults: {
            'RTI': []
        },

        url: function() {
           return conf.urlFor('places_id') + this.id;
        },

        renderRTI: function(target, timeout, type) {
            var attrs = this.getCurrentRTI();
            var RTIModel = RTIModels[attrs.type];
            this.rti = new RTIModel(attrs);
            var RTIView = RTIViews[attrs.type];
            var rtiView = new RTIView({model: this.rti, el: target});
            this.rti.fetch();
            if (timeout) {
                return setInterval(_.bind(this.rti.fetch, this.rti), timeout);
            }
        },

        getMapFeature: function() {
            // Returns a Leaflet object ready for placing a map.
            //
            // Shapes are preferred over markers
            var feature;
            if (this.has('shape')) {
                try {
                    feature = L.geoJson(wellknown(this.get('shape')), {
                        color: '#44687D', // Outline colour - pantone 5405
                        opacity: 1,
                        fill: true,
                        fillColor: '#3277AE', // Colour of our <a>
                        fillOpacity: 0.2,
                        weight: 2, // Outline weight in pixels
                    });
                } catch (e) {
                    console.log("Error parsing WKT");
                    console.log(this.get('shape'));
                    console.log(e);
                }
            } else if (this.hasLocation()) {
                var latlng = new L.LatLng(this.get('lat'), this.get('lon'));
                var icon = new L.icon({
                        iconUrl: 'images/maps/marker-icon.png',
                        iconRetinaUrl: 'images/maps/marker-icon-2x.png',
                        iconSize: [50, 50],
                        iconAnchor: [25, 25],
                        popupAnchor: [-3, -76],
                        shadowUrl: 'images/maps/marker-shadow.png',
                        shadowRetinaUrl: 'images/maps/marker-shadow-2x.png',
                        shadowSize: [50, 50],
                        shadowAnchor: [25, 25]
                });
                feature = new L.marker(latlng, {title: this.get('name'), icon: icon});
            }
            return feature;
        },

        hasLocation: function() {
            return this.has('lat') && this.has('lon');
        },

        getCurrentRTI: function() {
            var showRTI = this.get('showRTI');
            var types = showRTI ? [showRTI] : DEFAULT_RTI_TYPES;
            return _.find(this.get('RTI'), function(rti) { return _.contains(types, rti.type); });
        },

        getAlternateRTI: function() {
            var showRTI = this.get('showRTI');
            var types = showRTI ? [showRTI] : DEFAULT_RTI_TYPES;
            return _.filter(this.get('RTI'), function(rti) { return !_.contains(types, rti.type); });
        },

        parse: function(data) {
            // Get all images for this POI
            data.images = [];
            if ('_embedded' in data && 'files' in data._embedded) {
                data.images = _.where(data._embedded.files, {type: 'depiction'});
                // Grab a primary image if possible
                data.primary_image = _.findWhere(data._embedded.files, {type: 'depiction', primary: true});
            }
            data.RTI = [];
            _.each(data._links, function(val, key) {
                if (key.indexOf('rti:') === 0) {
                    // Remove the rti: from the front
                    // and set it as a type attr
                    val.type = key.substring(4);
                    data.RTI.push(val);
                }
            });
            return data;
        }

    });

    // Returns the Model class
    return POI;

});
