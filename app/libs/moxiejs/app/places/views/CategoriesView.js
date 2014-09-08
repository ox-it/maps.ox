define(['jquery', 'underscore', 'backbone', 'app', 'moxie.conf', 'moxie.position', 'places/utils', 'places/collections/CategoryCollection', 'places/collections/AdditionalPOICollection', 'hbs!places/templates/categories'],
    function($, _, Backbone, app, conf, userPosition, utils, Categories, AdditionalPOIs, categoriesTemplate){

    var CategoriesView = Backbone.View.extend({

        // View constructor
        initialize: function(options) {
            this.options = options || {};
            _.bindAll(this);
            this.category_name = this.options.category_name;
            this.collection.on('reset', this.render, this);
        },

        manage: true,
        template: categoriesTemplate,
        serialize: function() {
            var context = {};
            var category;
            if (this.category_name) {
                category = this.collection.find(function(model) { return model.get('type_prefixed') === this.category_name; }, this);
            } else {
                category = this.collection.findWhere({depth: 1});
            }
            if (category) {
                context.types = new Categories(category.getChildren()).toJSON();
                _.each(context.types, function(cat) {
                    if (cat.toggle && _.contains(this.visibleLayers, cat.type_prefixed)) {
                        cat.checked = true;
                    }
                }, this);
                context.category = category.toJSON();
            }
            context.amenities = this.category_name === '/amenities';
            context.university = this.category_name=== '/university';
            return context;
        },

        cleanup: function() {
            this.collection.off('reset', this.render, this);
        },

        events: {
            'keypress :input[type="text"]': "searchKeypressEvent",
            'click :input[type="submit"]': "searchClickEvent",
            'click .deleteicon': "clearSearch",
            'change .results-list input': "toggleCategory"
        },


        additionalCategories: {},
        toggleCategory: function(ev) {
            var category_name = ev.target.name;
            var checked = ev.target.checked;
            var $element = $(ev.target);
            if (checked) {
                $element.parent().parent().parent().addClass('highlighted');
            } else {
                $element.parent().parent().parent().removeClass('highlighted');
            }
            if (category_name in this.additionalCategories) {
                this.additionalCategories[category_name].visible = !checked;
                this.additionalCategories[category_name].toggle();
            } else {
                var category = this.collection.findWhere({type_prefixed: category_name});
                var defaultQuery = category.get('defaultQuery') || {type: category_name, count: 200};
                var pois = new AdditionalPOIs({
                    defaultQuery: defaultQuery,
                    format: conf.formats.geoJSON,
                    icon: category.get('icon'),
                    hasRTI: category.get('hasRTI')
                });
                this.additionalCategories[category_name] = pois;
                Backbone.trigger('map:additional-collection', pois, category_name);
                pois.toggle();
            }
        },

        clearSearch: function(e) {
            this.$('.search-input input').val('').focus();
        },

        attributes: {
            'class': 'generic'
        },
        searchClickEvent: function(ev) {
            var term = this.$(':input[type="text"]').val();
            this.searchForTerm(term);
        },
        searchKeypressEvent: function(ev) {
            if (ev.which === 13) {
                this.searchForTerm(ev.target.value);
            }
        },
        searchForTerm: function(term) {
            var qstring = $.param({q: term, type: this.category_name}).replace(/\+/g, "%20");
            var path = Backbone.history.reverse('search') + '?' + qstring;
            app.navigate(path, {trigger: true, replace: false});
        },

        beforeRender: function() {
            Backbone.trigger('domchange:title', "Places " + this.category_name);
        },
    });
    return CategoriesView;
});
