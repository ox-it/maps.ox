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

        childTypes: {
            '/university/site': {relation: 'occupies', index: 1},
            '/university/building': {relation: 'occupies', index: 2},
            '/university/library': {relation: 'libraries', index: 3},
            '/university/room': {relation: 'contains', index: 4},
            '/leisure/museum': {relation: 'contains', index: 5},
            '/university/department': {relation: 'organisations', index: 6},
            '/university/college': {relation: 'organisations', index: 7},
        },

        serialize: function() {
            var poi = this.model.toJSON();
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
            var depiction;
            if (poi.picture_depiction && poi.picture_depiction.length > 0) {
                depiction = poi.picture_depiction[0];
            }

            var context = {
                showZoomButton: false,
            };
            if (poi._links) {
                for (var i in poi._links.child) {
                    var child = poi._links.child[i];
                    if (child.type) {
                        var type = child.type[0];
                        var childObj = child;
                        if (this.additionalPOIs && this.additionalPOIs.length > 0) {
                            var additionalPOI = this.additionalPOIs.get(child.href.split('/').pop());
                            if (additionalPOI) {
                                if (additionalPOI.has('number')) {
                                    context.showZoomButton = true;
                                }
                                childObj = additionalPOI.toJSON();
                            }
                        }
                        if (type in this.childTypes) {
                            if (this.childTypes[type].relation in context) {
                                context[this.childTypes[type].relation].push(childObj);
                            } else {
                                context[this.childTypes[type].relation] = [childObj];
                            }
                        } else if ('contains' in context) {
                            context.contains.push(childObj);
                        } else {
                            context.contains = [childObj];
                        }
                    }
                }
                if (poi._links.parent) {
                    context.partOf = [];
                    context.occupiedBy = [];
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

            return _.extend(context, {
                poi: poi,
                multiRTI: poi.RTI.length > 1,
                alternateRTI: this.model.getAlternateRTI(),
                currentRTI: this.model.getCurrentRTI(),
                currentlyOpen: currentlyOpen,
                parsedOpeningHours: parsedOpeningHours,
                depiction: depiction,
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
                        poids.push(child.href.split('/').pop());
                    });
                    if (poids.length === 1) {
                        var poi = new NumberedPOI({id: poids[0], singlePOI: true});
                        poi.fetch({success: _.bind(this.render, this)});
                        this.additionalPOIs =  new NumberedPOICollection([poi]);
                    } else {
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
