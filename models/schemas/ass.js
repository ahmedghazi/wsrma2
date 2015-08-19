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
        },
        reports: {
            index: true,
            type: Number
        },
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        },
        user: {
            type: rapido.mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        raters: {
            type: Array
        }
    });
    return schema;
};

module.exports = Ass;
