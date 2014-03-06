define(['backbone', 'jquery', 'moxie.position', 'core/views/MapView', 'hbs!core/templates/map-browse'], function(Backbone, $, userPosition, MapView, mapBrowseTemplate) {

    var MapBrowseLayout = Backbone.View.extend({
        initialize: function(options) {
            options = options || {};
            this.followUser = options.followUser;
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
            if (!this.followingUser) {
                userPosition.follow(this.mapView.handle_geolocation_query, this.mapView);
                this.followingUser = true;
                locationButton.addClass('active');
            } else {
                userPosition.toggleWatching();
                locationButton.toggleClass('active');
            }
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
            if (this.followUser) {
                userPosition.follow(this.mapView.handle_geolocation_query, this.mapView);
                this.followingUser = true;
            }
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
