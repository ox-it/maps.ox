define(['jquery', 'underscore', 'backbone', 'app', 'moxie.conf', 'moxie.position', 'places/utils', 'places/collections/CategoryCollection', 'hbs!places/templates/categories', 'hbs!places/templates/requesting_geolocation', 'hbs!places/templates/error_geolocation'],
    function($, _, Backbone, app, conf, userPosition, utils, Categories, categoriesTemplate, geoRequesting, geoError){

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
                context.category = category.toJSON();
            }
            return context;
        },

        cleanup: function() {
            this.collection.off('reset', this.render, this);
        },

        events: {
            'keypress :input': "searchEvent",
            'click .deleteicon': "clearSearch"
        },

        clearSearch: function(e) {
            this.$('.search-input input').val('').focus();
        },

        attributes: {
            'class': 'generic'
        },

        searchEvent: function(ev) {
            if (ev.which === 13) {
                var query = ev.target.value;
                var qstring = $.param({q: query}).replace(/\+/g, "%20");
                var path = Backbone.history.reverse('search') + '?' + qstring;
                app.navigate(path, {trigger: true, replace: false});
            }
        },

        setCategoryData: function(data) {
            this.category_data = data;
            this.renderCategories();
        },

        renderCategories: function() {
            this.$(".preloader").hide();
            var context;
            if (this.category_name) {
                var category_hierarchy = this.category_name.split('/');
                context = utils.getCategory(category_hierarchy, this.category_data);
                // updating base template with type name
                this.$("#category_title").text(context.type_name_plural);
                this.$("#input_search").attr("placeholder", "Search " + context.type_name_plural.toLowerCase() + "...");
            } else {
                context = {types: this.category_data.types};
            }
            context.category_name = (this.category_name) ? this.category_name : "";
            this.$("#categories").html(categoriesTemplate(context));
        },

        beforeRender: function() {
            Backbone.trigger('domchange:title', "Places " + this.category_name);
        },
        afterRender: function() {
            userPosition.on('position:unpaused', function() {
                this.$('.messages').html(geoRequesting());
            }, this);
            userPosition.on('position:error', function() {
                this.$('.messages').html(geoError());
            }, this);
        }
    });
    return CategoriesView;
});
