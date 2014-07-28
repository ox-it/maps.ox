define(['jquery', 'backbone', 'underscore', 'moxie.conf', 'core/views/ErrorView', 'places/collections/NumberedPOICollection', 'places/models/NumberedPOIModel', 'hbs!places/templates/detail'],
    function($, Backbone, _, conf, ErrorView, NumberedPOICollection, NumberedPOI, detailTemplate){
    var RTI_REFRESH = 15000;    // 15 seconds
    var DetailView = Backbone.View.extend({

        initialize: function() {
            Backbone.on('favourited', this.favourited, this);
            this.model.on('sync', this.render, this);
            this.model.on('error', this.renderError, this);
        },
        attributes: {
            'class': 'content-detail'
        },

        events: {
            'click a.zoom-all': 'zoomToAll',
        },

        zoomToAll: function(ev) {
            ev.preventDefault();
            Backbone.trigger('map:zoom-all-markers');
            return false;
        },

        renderError: function(model, response) {
            // Error fetching from the API, render a nice error message.
            var message;
            if (response.status === 404) {
                // Set a specific message for 404's
                message = "Could not find resource: " + model.id;
            } else {
                message = "Error fetching resource: " + model.id;
            }
            var errorView = new ErrorView({
                message: message,
                el: this.el
            });
            errorView.render();
        },

        excludedTypes: ['/university/room'],
        // Used to filter down to the POIs we display in the DetailView
        // these are all POIs not of a type in excludedTypes or any POI
        // with multiple `type`s
        inclusionPredicate: function(poi) {
            return (poi.type && ((poi.type.length > 1) || (!_.contains(this.excludedTypes, poi.type[0]))));
        },

        childTypes: {
            '/university/site': {relation: 'occupies', index: 1},
            '/university/building': {relation: 'occupies', index: 2},
            '/university/library': {relation: 'libraries', index: 3},
            '/leisure/museum': {relation: 'contains', index: 5},
            '/university/department': {relation: 'organisations', index: 6},
            '/university/college': {relation: 'organisations', index: 7},
        },

        // These each contain the Image() element as it loads
        // and once it has fully loaded respectively.
        image: null,
        loadingImage: null,

        serialize: function() {
            var poi = this.model.toJSON();
            if (poi.midFetch === true) {
                return {poi: poi};
            }
            var currentlyOpen = null;
            var parsedOpeningHours = null;
            if (poi.opening_hours) {
                try {
                    parsedOpeningHours = TimeDomain.evaluateInTime(poi.opening_hours);
                    currentlyOpen = parsedOpeningHours.value;
                } catch(err) {
                    parsedOpeningHours = null;
                    currentlyOpen = null;
                }
            }

            // Do we have an image? is it loaded?
            var depiction = poi.primary_image || poi.images[0];
            var hasDepiction = false;
            if (this.image || this.loadingImage) {
                hasDepiction = true;
            } else if (depiction && 'url' in depiction) {
                // Create Image to load in background
                this.loadingImage = new Image();
                this.loadingImage.onload = _.bind(function() {
                    this.image = this.loadingImage;
                    this.render();  // Image has loaded, render the view
                }, this);
                this.loadingImage.src = depiction.url;
                hasDepiction = true;
            }

            var context = {
                showZoomButton: false,
                contains: [],
                partOf: [],
                occupiedBy: [],
                hasDepiction: hasDepiction,
                image: this.image,
                socialLinks: poi.social_facebook || poi.social_twitter,
            };
            if ('accessibility' in poi) {
                if ('access_guide_url' in poi.accessibility) {
                    context.accessibilityGuideURL = poi.accessibility.access_guide_url;
                }
                if ('access_guide_contents' in poi.accessibility) {
                    context.accessibilityGuideContents = poi.accessibility.access_guide_contents;
                }
            }
            if (this.additionalPOIs && this.additionalPOIs.numberOfMarkers && this.additionalPOIs.numberOfMarkers > 1) {
                context.showZoomButton = true;
            }
            if (poi._links) {
                var links = _.filter(poi._links.child, this.inclusionPredicate, this);
                _.each(links, function(child) {
                    var type = child.type[0];
                    var childObj = child;
                    // We look in additionalPOIs for the child as we *may* have it
                    // this depends on if the request to get all the children objects
                    // has completed.
                    if (this.additionalPOIs && this.additionalPOIs.length > 0) {
                        var additionalPOI = this.additionalPOIs.get(child.href.split('/').pop());
                        if (additionalPOI) {
                            childObj = additionalPOI.toJSON();
                        }
                    }
                    if (type in this.childTypes) {
                        if (this.childTypes[type].relation in context) {
                            context[this.childTypes[type].relation].push(childObj);
                        } else {
                            context[this.childTypes[type].relation] = [childObj];
                        }
                    } else {
                        context.contains.push(childObj);
                    }
                }, this);
                if (poi._links.parent) {
                    var parents = [];
                    if (!$.isArray(poi._links.parent)) {
                        parents.push(poi._links.parent);
                    } else {
                        parents = poi._links.parent;
                    }
                    var parent;
                    for (var i in parents) {
                        parent = parents[i];
                        if (parent.type) {
                            switch (parent.type[0]) {
                                case '/leisure/museum':
                                case '/university/department':
                                    if (poi.type[0]==='/university/building') {
                                        context.occupiedBy.push(parent);
                                    } else {
                                        context.partOf.push(parent);
                                    }
                                    break;
                                default :
                                    context.partOf.push(parent);
                                    break;
                            }
                        }
                    }
                }
            }
            _.each(context, function(relations, key) {
                if (_.isArray(relations)) {
                    var sortedRels = _.sortBy(relations, function(poi) {
                        return poi.number || 1000;
                    });
                    context[key] = sortedRels;
                }
            });

            return _.extend(context, {
                poi: poi,
                multiRTI: poi.RTI.length > 1,
                alternateRTI: this.model.getAlternateRTI(),
                currentRTI: this.model.getCurrentRTI(),
                currentlyOpen: currentlyOpen,
                parsedOpeningHours: parsedOpeningHours
            });
        },
        template: detailTemplate,
        manage: true,


        additionalPOIs: null,

        beforeRender: function() {
            if (!this.additionalPOIs) {
                if (this.model.has('_links')) {
                    var children = this.model.get('_links').child || [];
                    var poids = [];
                    _.each(children, function(child) {
                        if (this.inclusionPredicate(child)) {
                            poids.push(child.href.split('/').pop());
                        }
                    }, this);
                    if (poids.length === 1) {
                        var poi = new NumberedPOI({id: poids[0], singlePOI: true});
                        poi.fetch({success: _.bind(this.render, this)});
                        this.additionalPOIs =  new NumberedPOICollection([poi]);
                    } else if (poids.length > 1) {
                        this.additionalPOIs =  new NumberedPOICollection({
                            sortFunction: _.bind(function(child) {
                                if (child.type[0] in this.childTypes) {
                                    return this.childTypes[child.type[0]].index;
                                } else {
                                    return 100;
                                }
                            }, this),
                            url: conf.urlFor('places_id') + poids.join(','),
                        });
                        this.additionalPOIs.fetch({success: _.bind(this.render, this)});
                    }
                }
            } else {
                Backbone.trigger('map:numbered-collection', this.additionalPOIs);
            }
            if (this.model.get('name')) {
                Backbone.trigger('domchange:title', this.model.get('name'));
            } else if (this.model.get('type_name')) {
                Backbone.trigger('domchange:title', this.model.get('type_name'));
            }
        },

        afterRender: function() {
            if (this.model.get('RTI').length > 0) {
                this.refreshID = this.model.renderRTI(this.$('#poi-rti')[0], RTI_REFRESH);
            }
        },

        favourited: function(fav) {
            fav.set('options', {model: this.model.toJSON()});
            fav.set('type', 'poi:'+this.model.get('type'));
            fav.save();
        },

        cleanup: function() {
            Backbone.off('favourited');
            clearInterval(this.refreshID);
        }

    });
    return DetailView;
});
