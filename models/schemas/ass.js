var Ass = function (rapido) {
    var schema = new rapido.mongoose.Schema({
        date_created: {
            index: true,
            type: Date, default: Date.now
        },
        img: {
            unique: true,
            index: true,
            type: String
        },
        ratings: {
            index: true,
            type: Array
        },
        average: {
            index: true,
            type: Number,
            default: 5
        }
    });
    return schema;
};
module.exports = Ass;
