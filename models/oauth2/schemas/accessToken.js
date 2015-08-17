var AccessToken = function (rapido) {

    var schema = new rapido.mongoose.Schema({
        token: {
            unique: true,
            type: String,
            index: true
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

module.exports = AccessToken;