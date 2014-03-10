define(["backbone", "underscore", "leaflet", "moxie.conf", "places/collections/POICollection"], function(Backbone, _, L, conf, POIs) {
    var AdditionalPOIs = POIs.extend({
        initialize: function() {
            POIs.prototype.initialize.apply(this, arguments);
            if (this.options.toggleEvent) {
                Backbone.on(this.options.toggleEvent, this.toggle, this);
            }
        },

        getIcon: function() {
            var options = this.options.icon || {};
            return new L.Icon(options);
        },

        visible: false,
        toggle: function() {
            // Should this Collection of POIs be shown now?
            //
            // If a collection is empty and toggle is called we fetch()
            // then call toggle() again to display the results of the
            // fetch().
            if (this.options.format && this.options.format === conf.formats.geoJSON) {
                if (this.geoJSON && this.geoJSON.features) {
                    if (this.visible) {
                        this.trigger('hide', this);
                        this.visible = false;
                    } else {
                        this.trigger('show', this);
                        this.visible = true;
                    }
                } else {
                    this.geoFetch({success: _.bind(function() {
                        this.toggle();
                    }, this)});
                }
            } else {
                throw new Error("only geoJSON collections can be toggled!");
            }
        },
        parse: function(data) {
            // Fetch over
            this.ongoingFetch = false;
            this.geoJSON = data;
            return [];
        },
    });
    return AdditionalPOIs;
});
