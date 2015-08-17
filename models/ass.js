var Ass = function (rapido) {
	//console.log("=========================== ASS")
    var Schema = require('./schemas/ass');
    var ass = new Schema(rapido);
    return rapido.mongoose.model('Ass', ass);
};
module.exports = Ass;