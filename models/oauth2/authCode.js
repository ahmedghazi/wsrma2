var AuthCode = function (rapido) {
    var Schema = require('./schemas/authCode');
    var authCode = new Schema(rapido);
    return rapido.mongoose.model('AuthCode', authCode);
};

module.exports = AuthCode;