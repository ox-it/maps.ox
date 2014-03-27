define(['backbone', 'underscore', 'jquery', 'moxie.position', 'core/views/MapView', 'hbs!core/templates/map-browse', 'hbs!places/templates/requesting_geolocation', 'hbs!places/templates/error_geolocation'], function(Backbone, _, $, userPosition, MapView, mapBrowseTemplate, geoRequesting, geoError) {

    var MapBrowseLayout = Backbone.View.extend({
        initialize: function(options) {
            options = options || {};
        },
        manage: true,
        template: mapBrowseTemplate,
        className: 'map-browse-layout',
        name: 'MapBrowseLayout',
        events: {
            'click .btn-toggle-browse': 'toggleBrowse',
            'click .btn-toggle-location': 'toggleLocation',
            'click .btn-toggle-cycling': 'toggleCycling',
            'click .btn-toggle-driving': 'toggleDriving',
            'click .btn-toggle-public-transport': 'togglePublicTransport',
        },

        toggleDriving: function() {
            Backbone.trigger('places:toggle-driving');
        },
        toggleCycling: function() {
            Backbone.trigger('places:toggle-cycling');
        },
        togglePublicTransport: function() {
            Backbone.trigger('places:toggle-public-transport');
        },

        toggleBrowse: function() {
            this.$el.toggleClass('with-browse');
            this.mapView.invalidateMapSize();
        },
        toggleLocation: function(ev) {
            var locationButton = $('.btn-toggle-location');
            userPosition.toggleWatching();
            locationButton.toggleClass('active');
        },

        // Previously we set this view in 'views' this is WRONG
        //
        // That way the view is a class attribute rather than being
        // created when it is required, as it is here (beforeRender)
        //
        // See commit #6511cae
        beforeRender: function() {
            this.mapView = new MapView();
            this.setView(".content-map", this.mapView);
        },
        afterRender: function() {
            userPosition.follow(this.mapView.handle_geolocation_query, this.mapView);
            userPosition.on('position:error', _.bind(function(err) {
                userPosition.pauseWatching({silent: true});
                var locationButton = $('.btn-toggle-location');
                if (locationButton) {
                    locationButton.removeClass('active');
                }
            }, this));
            userPosition.on('position:unpaused', function() {
                this.$('.messages').html(geoRequesting());
            }, this);
            userPosition.on('position:paused', function() {
                this.$('.messages').html('');
            }, this);
            userPosition.on('position:updated', function() {
                this.$('.messages').html('');
            }, this);
            userPosition.on('position:error', function() {
                this.$('.messages').html(geoError());
            }, this);
        },
        removeDetail: function() {
            this.$el.removeClass('with-detail');
            this.mapView.invalidateMapSize();
        },
        withDetail: function() {
            this.$el.addClass('with-detail');
            this.mapView.invalidateMapSize();
        },
        removeBrowse: function() {
            this.$el.removeClass('with-browse');
            this.mapView.invalidateMapSize();
        },
        withBrowse: function() {
            this.$el.addClass('with-browse');
            this.mapView.invalidateMapSize();
        },
    });

    return MapBrowseLayout;
});
