var Client = function (rapido) {
    var Schema = require('./schemas/client');
    var client = new Schema(rapido);
    return rapido.mongoose.model('Client', client);
};

module.exports = Client;