define(["underscore", "backbone", "moxie.conf", "cordova.help"], function(_, Backbone, conf, cordova){
    var EVENT_POSITION_UPDATED = 'position:updated';
    var EVENT_POSITION_PAUSED = 'position:paused';
    var EVENT_POSITION_UNPAUSED = 'position:unpaused';
    var EVENT_POSITION_ERROR = 'position:error';
    function UserPosition() {
        _.extend(this, Backbone.Events);
        var supportsGeoLocation = Boolean(navigator.geolocation),
            latestPosition = null,
            positionPaused = false,
            positionInterval;
        this.getCurrentLocation = function() {
            // This is used in lieu of conf.defaultLocation as it
            // might provide a better result (eg. a recent known
            // location from the geolocation APIs)
            return latestPosition;
        },
        this.getLocation = function(cb, options) {
            if (cordova.isCordova() && !cordova.appReady()) {
                // Only call navigator.geolocation when "deviceready"
                //
                // This prevents us using the WebView geolocation features and
                // ensures we use the cordova geolocation plugin.
                //
                // For iOS this has the added benefit of only prompting once
                // for the user to allow geolocation.
                cordova.onAppReady(_.bind(this.getLocation, this, cb, options));
                return;
            }
            options = options || {};
            // If we don't get a location within the errorMargin before the Timeout
            // we return the most recent position reported by watchPosition
            options.errorMargin = options.errorMargin || conf.position.errorMargin;
            options.timeout = options.timeout || conf.position.accuracyTimeout;
            var temporaryGeoWatchID;
            var accuracyTimeout = setTimeout(function() {
                navigator.geolocation.clearWatch(temporaryGeoWatchID);
                if (latestPosition) {
                    cb(latestPosition);
                }
            }, options.timeout);
            temporaryGeoWatchID = navigator.geolocation.watchPosition(function(position) {
                latestPosition = position;
                if (latestPosition.coords && latestPosition.coords.accuracy && latestPosition.coords.accuracy <= options.errorMargin) {
                    window.clearTimeout(accuracyTimeout);
                    navigator.geolocation.clearWatch(temporaryGeoWatchID);
                    cb(latestPosition);
                }
            }, _.bind(locationError, this),
            {
                    enableHighAccuracy: conf.position.enableHighAccuracy,
                    maximumAge: conf.position.maximumAge,
                    timeout: options.timeout,
            });

        };
        function locationSuccess(position) {
            if (positionPaused) {
                console.log("Position captured whilst paused. Callback not fired.");
            } else {
                this.trigger(EVENT_POSITION_UPDATED, position);
            }
        }
        function locationError(err) {
            this.trigger(EVENT_POSITION_ERROR, err);
        }
        function startWatching() {
            if (supportsGeoLocation) {
                this.getLocation.apply(this, [_.bind(locationSuccess, this)]);
                if (this.positionInterval) {
                    // Prevents us from starting multiple intervals
                    window.clearInterval(this.positionInterval);
                }
                this.positionInterval = window.setInterval(_.bind(this.getLocation, this), conf.position.updateInterval, _.bind(locationSuccess, this));
                // NOTE: only trigger EVENT_POSITION_UNPAUSED *after* positionInterval is set,
                //       we have listeners which call startWatching on EVENT_POSITION_UNPAUSED
                //       so it has to be triggered after an interval is made otherwise recursive
                //       calls to startWatching happen.
                if (positionPaused) {
                    this.trigger(EVENT_POSITION_UNPAUSED);
                }
            } else {
                locationError.apply(this);
            }
        }
        var followerCount = 0;
        this.follow = function(cb, context) {
            context = context || this;
            if (!positionPaused && !this.positionInterval) {
                // Call the "private" function with the correct context
                startWatching.apply(this);
            }
            this.on(EVENT_POSITION_UPDATED, cb, context);
            followerCount++;
            // Send user latest userPosition (not default)
            if (latestPosition) {
                cb.apply(context, [latestPosition]);
            }
        };
        this.unfollow = function(cb, context) {
            if (context) {
                this.off(EVENT_POSITION_UPDATED, null, context);
            } else {
                this.off(EVENT_POSITION_UPDATED, cb);
            }
            followerCount--;
            if (followerCount === 0) {
                window.clearInterval(this.positionInterval);
                this.positionInterval = null;
            }
        };
        this.pauseWatching = function(options) {
            // Pauses any new position updates being fired until `unpauseWatching` is called.
            //
            // Triggers EVENT_POSITION_PAUSED, unless {silent: true} is passed as an option.
            options = options || {};
            options.silent = options.silent || false;
            // Pauses all listening on position changes
            window.clearInterval(this.positionInterval);
            this.positionInterval = null;
            positionPaused = true;
            if (!options.silent) {
                this.trigger(EVENT_POSITION_PAUSED);
            }
        };
        this.unpauseWatching = function(options) {
            // Starts watching position updates.
            //
            // Triggers EVENT_POSITION_UNPAUSED, unless {silent: true} is passed as an option.
            options = options || {};
            options.silent = options.silent || false;
            positionPaused = false; // Set positionPaused first so we actually start following
            startWatching.apply(this);
            if (!options.silent) {
                this.trigger(EVENT_POSITION_UNPAUSED);
            }
        };
        this.toggleWatching = function() {
            if (this.positionInterval) {
                this.pauseWatching();
            } else if (followerCount !==0) {
                this.unpauseWatching();
            }
            return positionPaused;
        };
        this.listening = function() {
            // Returns true if currently watching user position
            // else returns false
            return Boolean(this.positionInterval);
        };
    }
    return new UserPosition();
});
