define(['MoxieModel'], function(MoxieModel) {
    function slugify(text) {
        text = text.replace(/[^\-a-zA-Z0-9,&\s]+/ig, '');
        text = text.replace(/-/gi, "_");
        text = text.replace(/\s/gi, "-");
        text = text.toLowerCase();
        return text;
    }
    var EntryModel = MoxieModel.extend({
        idAttribute: "slug",
        parse: function(entry) {
            entry.slug = slugify(entry.title);
            return entry;
        }
    });
    return EntryModel;
});
