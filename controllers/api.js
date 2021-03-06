var ApiController = function(rapido) {
    var express = require('express');
    this.router = express.Router();
    var fs = require('fs');
    var formidable = require('formidable');
    var path = require('path');
    var async = require('async');
    var Ass = rapido.getModel('ass');
    var User = rapido.getModel('user');

//console.log(Ass)
    var postsPerPage = 5;

    // GET LAST ASSES
    this.router.get('/', function(req, res){
        return Ass
                .find()
                .sort({date_created: 'desc'})
                //.limit(postsPerPage)
                .exec(function(err, asses) {
            if (err) {
                console.log(err);
                return next(err);
            }
            
            return res.json(asses);
        });
    });

    // PAGINATION
    this.router.get('/page/:id', function(req, res){
        //req.session = "";
        var user = req.session.user;
        //console.log(user);
        if(!user && req.query){
            var email = req.query.uuid+"@rma.io";
            user = User.find(
                { 'email': email }, 
                function(err, user) {  
                    if (err) {
                        console.log(err);
                        console.log('Signup error');

                        var email = req.query.uuid+"@rma.io";
                        var user = new User({
                            name: req.query.uuid,
                            email: email
                        });

                        user.save(function (err) {
                            var user_exists = false;
                            if (err) {
                                if (err.code != 11000) {
                                    return next(err);
                                }else{
                                    req.session.user = user;
                                    //console.log(user);
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
                                        
                                        return res.json(asses);
                                    });

                                }
                            }
                        });

                    }else{
                        //console.log(user);
                        req.session.user = user;
                        var skip = parseInt(req.params.id * postsPerPage);
                        
                        return Ass
                                // VOTE UNIQUE
                                //.find( {raters: {$nin: [req.session.user._id] }})
                                .find()
                                .sort({date_created: 'desc'})
                                .limit(postsPerPage)
                                .skip(skip)
                                .exec(function(err, asses) {
                            if (err) {
                                console.log(err);
                                return next(err);
                            }
                            
                            return res.json(asses);
                        });
                    }
                    
            });
        }else{
            var skip = parseInt(req.params.id * postsPerPage);
            
            return Ass
                    // VOTE UNIQUE
                    //.find( {raters: {$nin: [req.session.user._id] }})
                    .find()
                    .sort({date_created: 'desc'})
                    .limit(postsPerPage)
                    .skip(skip)
                    .exec(function(err, asses) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                
                return res.json(asses);
            });
        }

        
    });
    
    // GET TOP ASSES
    this.router.get('/top', function(req, res){
        return Ass
                .find()
                .sort({average: 'desc'})
                .limit(postsPerPage)
                .exec(function(err, asses) {
            if (err) {
                console.log(err);
                return next(err);
            }
            
            return res.json(asses);
        });
    });

    // GET TOP ASSES PAGINATION
    this.router.get('/top/page/:id', function(req, res){
        var skip = parseInt(req.params.id * postsPerPage);
        return Ass
                .find()
                .sort({average: 'desc'})
                .limit(postsPerPage)
                .skip(skip)
                .exec(function(err, asses) {
            if (err) {
                console.log(err);
                return next(err);
            }
            
            return res.json(asses);
        });
    });

    // GET TOP ASSES PAGINATION
    this.router.get('/users', function(req, res){
        return User
                .find()
                .exec(function(err, asses) {
            if (err) {
                console.log(err);
                return next(err);
            }
            
            return res.json(asses);
        });
    });
    

    this.router.get('/c', function(req, res){
        return res.render('c', {
            title: "UPLOAD"
        });
    });

    this.router.post('/c', function(req, res){
        console.log("form create")
        //console.log(Ass)
        
        var formF = new formidable.IncomingForm({ uploadDir: path.dirname(__dirname) + '/tmp' });
        formF.parse(req, function(err, fields, files) {
            req.uploadFiles = files;
            req.fields = fields;
        });

        formF.on('progress', function(bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            console.log(percent_complete.toFixed(2));
        });

        formF.on('end', function (fields, files) {
            //console.log(req.uploadFiles)

            fs.readFile(req.uploadFiles.file.path, function (err, data) {
                var imageName = req.uploadFiles.file.name;

                /// If there's an error
                if(!imageName){
                    console.log("There was an error");
                    res.redirect("/");
                    res.end();

                } else {
                    var newPath = path.dirname(__dirname) + "/public/uploads/" + imageName;
                     /// write file to uploads/fullsize folder
                    fs.writeFile(newPath, data, function (err) {
                        console.log("writeFile end, imageName : "+imageName);

console.log(req.session.user)

                        var ass = new Ass({
                            img: imageName,
                            ratings: [],
                            average: 5,
                            reports: 0,
                            user: req.session.user._id
                        });

                        ass.save(function (err) {
                            if (!err) {
                                return console.log("ass created");
                                //return res.json(ass);
                            } else {
                                return console.log(err);
                            }
                        });

                        //return res.json(ass);
                        return res.json({'success':true, ass:ass});
                    });
                }
            });
        });
    });
    
    // UPDATE BATCH
    this.router.post('/ub', function(req, res){
        var data = req.body;
        var user = req.session.user;
        console.log(data)
        batchUpdate(data, user, function(err, _data) {
            if(err) {
              return;
            }
            console.log("done");
            return res.json({'success':true, data:_data});
        });
        

        
    });

    function batchUpdate(arr, user, callback) {

        var iteratorFcn = function(data, done) {
            var ratings = data.ratings
            //console.log("iteratorFcn : "+data.id)
            //console.log(data)

            var rates = 0;

            for(var i=0; i<ratings.length; i++){
                if(ratings[i] != null)rates += parseInt(ratings[i]);
            }
            
            var average = Math.floor(rates / ratings.length);
            if(isNaN(average))average = 5;

            // VOTE UNIQUE
            //var query = { _id: data.id, raters: { $nin: [ user._id ] } };
            var query = { _id: data.id };
            if(data.reports != ""){
                var update = { 
                    $set: {'ratings': ratings, 'average': average},
                    //$inc: {'reports': 1},
                    $push: {'raters': user._id}
                };
            }else{
                var update = { 
                    $set: {'ratings': ratings, 'average': average},
                    $push: {'raters': user._id}
                };
            }
            //var update = { $set: {'ratings': ratings, 'average': average} };
            
            Ass.findOneAndUpdate(query, update, {}, function (err, ass, raw) {
                if (!err) {
                    console.log("updated")
                    console.log(ass)
                    done();
                    return;
                } else {
                    console.log(err);
                }
            });
        };

        var doneIteratingFcn = function(err) {
            callback(err, []);
        };

        async.forEach(arr, iteratorFcn, doneIteratingFcn);
    }

    // UPDATE ASS
    this.router.post('/u/:id', function(req, res, next){
        return Ass.findById(req.params.id, function (err, ass) {
            if (err) {
                return next(err);
            }
            //console.log(ass)
            ass.ratings.push(req.body.rate);

            var rates = 0;
            for(var i=0; i<ass.ratings.length; i++){
                rates += parseInt(ass.ratings[i]);
            }
            
            var average = rates / ass.ratings.length;
            ass.average = Math.round(average);

            ass.save(function (err) {
                if (!err) {
                    return console.log("updated");
                } else {
                    return console.log(err);
                }
            });

            res.json(ass);
        });
    });

    
    // DELETE ASS
    this.router.get('/d/:id', function(req, res, next){
        return Ass.findById(req.params.id, function (err, ass) {
            if (err) {
                return next(err);
            }
            //console.log(story);
            ass.remove(function (err) {
                if (!err) {
                    return console.log("deleted");
                } else {
                    return console.log(err);
                }
            });

            res.json({'success':true, id:req.params.id});
        });
    });

    // DELETE ASS
    this.router.get('/flush', function(req, res, next){
        return Ass.findById(req.params.id, function (err, ass) {
            if (err) {
                return next(err);
            }
            //console.log(story);
            ass.remove(function (err) {
                if (!err) {
                    return console.log("deleted");
                } else {
                    return console.log(err);
                }
            });

            res.json({'success':true, id:req.params.id});
        });
    });


    return this;
};


module.exports = ApiController;