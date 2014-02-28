define(["MoxieModel"], function(MoxieModel) {

    var Category = MoxieModel.extend({
        getChildren: function() {
            var children = this.collection.where({parentcat: this.get('type_prefixed')});
            return children;
        }
    });

    return Category;

});
