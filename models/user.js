var User = function (rapido) {
    var Schema = require('./schemas/user');
    var user = new Schema(rapido);
    return rapido.mongoose.model('User', user);
};
module.exports = User;