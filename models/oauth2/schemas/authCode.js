var AuthCode = function (rapido) {

    var schema = new rapido.mongoose.Schema({
        code: {
            type: String,
            index: true
        },
        redirectURI: {
            type: String
        },
        user: {
            type: rapido.mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        client: {
            type: rapido.mongoose.Schema.Types.ObjectId,
            ref: 'Client'
        }
    });
    return schema;
};

module.exports = AuthCode;