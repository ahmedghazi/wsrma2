var DefaultController = function (rapido) {
    var express = require('express');
    this.router = express.Router();
    var Ass = rapido.getModel('ass');

    //Listen for route /
    this.router.get('/', function (req, res) {
        //session storage exemple
        var session = req.session;
        var count = session.count || 0;
        count++;
        session.count = count;

        return Ass
                .find()
                .sort({date_created: 'desc'})
                //.limit(postsPerPage)
                .exec(function(err, asses) {
                    if (err) {
                        console.log(err);
                        return next(err);
                    }
                    
                    return res.render('index', {
                        title: 'WSRMA',
                        asses: asses
                    });
        });
    });

    return this;
};

module.exports = DefaultController;