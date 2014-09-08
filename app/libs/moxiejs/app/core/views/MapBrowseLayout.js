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
            'click .overlay': 'toggleBrowse',
            'click .btn-toggle-browse': 'toggleBrowse',
            'click .btn-toggle-detail': 'toggleDetail',
            'click .btn-toggle-location': 'toggleLocation',
        },
        toggleBrowse: function() {
            this.$el.toggleClass('with-browse');
            this.mapView.invalidateMapSize();
        },
        toggleDetail: function() {
            var detailButton = $('.btn-toggle-detail span');
            if (detailButton.hasClass('fa-chevron-down')) {
                Backbone.trigger('places:navigate-map');
                detailButton.removeClass('fa-chevron-down');
                detailButton.addClass('fa-chevron-up');
            } else {
                Backbone.trigger('places:navigate-detail');
                detailButton.removeClass('fa-chevron-up');
                detailButton.addClass('fa-chevron-down');
            }
        },
        toggleLocation: function(ev) {
            this.mapView.toggleUserMarker();
            var locationButton = $('.btn-toggle-location');
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
            this.setView(".content-map", this.mapView, true);
        },
        afterRender: function() {
            userPosition.follow(this.mapView.handle_geolocation_query, this.mapView);
            userPosition.on('position:error', _.bind(function(err) {
                this.mapView.removeUserMarker();
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

            Backbone.on('showUser', function() {
                this.mapView.addUserMarker();
                var locationButton = $('.btn-toggle-location');
                locationButton.addClass('active');
            }, this);
        },
        removeDetail: function(options) {
            options = options || {};
            if (options.hidden) {
                this.$el.addClass('detail-hidden');
                var detailButton = $('.btn-toggle-detail span');
                detailButton.removeClass('fa-chevron-down');
                detailButton.addClass('fa-chevron-up');
            } else {
                this.$el.removeClass('detail-hidden');
            }
            this.$el.removeClass('with-detail');
            this.mapView.invalidateMapSize();
        },
        withDetail: function() {
            var detailButton = $('.btn-toggle-detail span');
            detailButton.removeClass('fa-chevron-up');
            detailButton.addClass('fa-chevron-down');
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
        hasBrowsePane: function() {
            return this.$el.hasClass('with-browse');
        },
    });

    return MapBrowseLayout;
});
