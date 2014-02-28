define(["core/collections/MoxieCollection", "underscore", "places/models/CategoryModel", "moxie.conf"], function(MoxieCollection, _, Category, conf) {

    var DEPTH_LIMIT = 3;
    var CategoryCollection = MoxieCollection.extend({
        model: Category,
        url: conf.urlFor('places_categories'),
        parse: function(data) {
            // The data Moxie presents for categories is in a (sensible) tree structure.
            // This kind of structure doesn't fit the Model/Collection paradigm in Backbone
            // too well, so we flatten the structure. We leave behind markers for 'depth' to
            // make fast queries on the content at depth 2 without any need to traverse again.
            var flattened_cats = [];
            function flatten_categories(depth, cats) {
                depth++;
                for (var i=0; i < cats.length; i++) {
                    var cat_data = cats[i];
                    // How far into the tree are we? This is kept around as a convenience.
                    cat_data.depth = depth;
                    if (cat_data.types && depth < DEPTH_LIMIT) {
                        cat_data.hasTypes = true;
                        flatten_categories(depth, cat_data.types);
                    }
                    // Don't include the recursive structure in the models
                    flattened_cats.push(_.omit(cat_data, ['types']));
                }
            }
            data.type = data.type || '/';
            data.type_prefixed = data.type || '/';
            flatten_categories(0, [data]);
            return flattened_cats;
        }
    });

    return CategoryCollection;

});
