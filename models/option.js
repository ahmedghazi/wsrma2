var Option = function (rapido) {
    var Schema = require('./schemas/option');
    var option = new Schema(rapido);
    return rapido.mongoose.model('Option', option);
};
module.exports = Option;