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
                        title: 'RATE MY ASS',
                        asses: asses
                    });
        });
    });

    this.router.get('/page/:id', function(req, res){
        var skip = parseInt(req.params.id * postsPerPage);

        return Ass
                .find()
                .sort({date_created: 'desc'})
                .limit(postsPerPage)
                .skip(skip)
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

    this.router.get('/user/:id', function(req, res){
        return Ass
                .find({'user._id':req.params.id})
                .sort({date_created: 'desc'})
                //.limit(postsPerPage)
                .exec(function(err, asses) {
                    if (err) {
                        console.log(err);
                        return next(err);
                    }
                    
                    return res.render('index', {
                        title: 'RATE MY ASS',
                        asses: asses
                    });
        });
    });

    return this;
};

module.exports = DefaultController;