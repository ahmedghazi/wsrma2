var User = function (rapido) {
    var schema = new rapido.mongoose.Schema({
        email: {
            unique: true,
            type: String,
            index: true
        },
        password: {
            type: String,
            index: true
        }
    });
    return schema;
};
module.exports = User;
