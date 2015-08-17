var Client = function (rapido) {
    var schema = new rapido.mongoose.Schema({
        name: {
            type: String
        },
        key: {
            type: String,
            index: true
        },
        secret: {
            type: String,
            index: true
        }
    });
    return schema;
};

module.exports = Client;