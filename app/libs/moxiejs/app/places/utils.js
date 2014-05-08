define(['underscore', 'moxie.conf', 'leaflet', 'moxie.position'], function(_, MoxieConf, L, userPosition){
    L.Icon.Default.imagePath = 'images/maps';
    var utils = {
        // This rather dense function takes the full set of categories
        getCategory: function(category_hierarchy, categories) {
            return _.reduce(category_hierarchy, function(categories, category_name) {
                return _.find(categories.types, function(cat) { return (cat.type===category_name); });
            }, categories);
        },
        getMap: function(el) {
            var position = MoxieConf.defaultLocation;
            if (('device' in window) && (window.device.platform==='Android')) {
                // Disable 3D acceleration for Android WebViews
                if ('console' in window) {
                    console.log("Android! Disabling 3D acceleration.");
                }
                L.Browser.any3d = false;
            }
            var mapOptions = MoxieConf.map.options || {};
            var map = new L.map(el, mapOptions).setView([position.coords.latitude, position.coords.longitude], MoxieConf.map.defaultZoom, true);

            // Add the tile layer
            var bounds = L.latLngBounds.apply(this, MoxieConf.map.primaryLayer.bounds);
            MoxieConf.map.primaryLayer.options.bounds = bounds;
            L.tileLayer(MoxieConf.map.primaryLayer.path, MoxieConf.map.primaryLayer.options).addTo(map);
            var secondaryLayer = L.tileLayer(MoxieConf.map.secondaryLayer.path, MoxieConf.map.secondaryLayer.options);
            map.on('moveend zoomend', function(ev) {
                var currentBounds = map.getBounds();
                var contained = bounds.contains(currentBounds);
                var hasSecondaryLayer = map.hasLayer(secondaryLayer);
                if (!contained && !hasSecondaryLayer) {
                    map.addLayer(secondaryLayer);
                } else if (contained && hasSecondaryLayer) {
                    map.removeLayer(secondaryLayer);
                }
            });
            map.attributionControl.setPrefix('');
            map.attributionControl.addAttribution('&copy <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors');
            return map;
        }
    };
    return utils;
});
