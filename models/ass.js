var Ass = function (rapido) {
	console.log("=========================== ASS")
    var Schema = require('./schemas/ass');
    console.log(Schema)
    var ass = new Schema(rapido);
    return rapido.mongoose.model('Ass', ass);
};
module.exports = Ass;