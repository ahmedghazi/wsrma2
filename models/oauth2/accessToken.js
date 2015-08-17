var AccessToken = function (rapido) {
    var Schema = require('./schemas/accessToken');
    var accessToken = new Schema(rapido);
    return rapido.mongoose.model('AccessToken', accessToken);
};

module.exports = AccessToken;