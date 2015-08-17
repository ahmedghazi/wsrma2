var Option = function (rapido) {
    var schema = new rapido.mongoose.Schema({
        name: {
            unique: true,
            type: String,
            index: true
        },
        value: Object
    });
    return schema;
};
module.exports = Option;