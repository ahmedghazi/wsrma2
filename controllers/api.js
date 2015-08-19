var ApiController = function(rapido) {
    var express = require('express');
    this.router = express.Router();
    var fs = require('fs');
    var http = require('http');
    var cheerio = require('cheerio');
    var formidable = require('formidable');
    var path = require('path');
    var async = require('async');
    var Ass = rapido.getModel('ass');
    var User = rapido.getModel('user');

console.log("in ApiController")

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
        var skip = parseInt(req.params.id * postsPerPage);

        var user = req.session.user;
        console.log(user);
        if(!user && req.query){
            console.log("no user found");
            var email = req.query.uuid+"@rma.io";
            if(req.query.uuid == undefined)email = "55d1b1e2f3ed9d2e28bc7614@rma.io"
            user = User.find(
                { 'email': email },
                function(err, user) {
                    if (err) {
                        console.log('user not found');
                    }

                    if(user.length == 0){
                        console.log("create user "+req.query.uuid+"@rma.io")
                        var email = req.query.uuid+"@rma.io";
                        
                        var user = new User({
                            email: email
                        });

                        user.save(function (err) {
                            //console.log("user.save")
                            console.log(err)
                            if (err) {
                                console.log(err)
                            }
console.log("user saved")
                            req.session.user = user;
                            //console.log(user);
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
                            
                            
                        });
                    }else{
                        console.log("user found");
                        console.log(user)
                        req.session.user = user;

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

                    
                    
            });
        }else{
            console.log("returning user");
            return Ass
                    // VOTE UNIQUE
                    .find( {raters: {$nin: [req.session.user._id] }})
                    //.find()
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
                .find( {raters: {$nin: [req.session.user._id] }})
                //.find()
                .sort({average: 'desc'})
                //.limit(postsPerPage)
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
    this.router.get('/my/page/:id', function(req, res){
        console.log("======================= my")
        console.log(typeof req.session.user)
        var userID = "";
        if(typeof req.session.user == Array)
            userID = req.session.user[0]._id;
        else 
            userID = req.session.user._id;
console.log("userID : "+userID);

        if(userID){
            console.log(userID)
            //var skip = parseInt(req.params.id * postsPerPage);
            return Ass
                    .find({'user':userID})
                    .sort({average: 'desc'})
                    //.limit(postsPerPage)
                    //.skip(skip)
                    .exec(function(err, asses) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                
                return res.json(asses);
            });
        }else{
            return res.json({msg:"no ass found"});
        }
        
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
        //console.log(req)
        //console.log(req.route.stack)
        var Latitude,Longitude;

        var formF = new formidable.IncomingForm({ uploadDir: path.dirname(__dirname) + '/tmp' });
        formF.parse(req, function(err, fields, files) {
            console.log(fields.UUID)
            
            req.uploadFiles = files;
            req.fields = fields;

            Latitude = fields.latitude;
            Longitude = fields.longitude;
        });

        formF.on('progress', function(bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            console.log(percent_complete.toFixed(2));
        });

        formF.on('end', function (fields, files) {
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

//console.log(req.session.user)

console.log(req.fields.latitude)
console.log(req.fields.longitude)
console.log(Latitude)
console.log(Longitude)

var userID = 0;
if(typeof req.session.user == Array)userID = req.session.user[0]._id
else userID = req.session.user._id
             
                        var ass = new Ass({
                            img: imageName,
                            ratings: [],
                            average: 5,
                            reports: 0,
                            user: userID,
                            latitude: req.fields.latitude,
                            longitude: req.fields.longitude
                        });

                        ass.save(function (err) {
                            if (!err) {
                                console.log(ass);
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
        console.log("/ub")
        console.log(req.user)
        
        var data = req.body;
        if(!req.session.user)return console.log("no user in session")
        //console.log(data)
        batchUpdate(data, req.session.user, function(err, _data) {
            if(err) {
              return;
            }
            console.log("done");
            return res.json({'success':true, data:_data});
        });
        

        
    });

    function batchUpdate(arr, user, callback) {
        console.dir(user)
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
            var query = { _id: data.id, raters: { $nin: [ user._id ] } };
            //var query = { _id: data.id };

            if(data.reports != ""){
                var update = { 
                    $set: {'ratings': ratings, 'average': average},
                    $inc: {'reports': 1},
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
                    //console.log(ass)
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
    this.router.get('/flush:id', function(req, res, next){
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
    this.router.get('/flush:id', function(req, res, next){
        return User.findById(req.params.id, function (err, user) {
            if (err) {
                return next(err);
            }
            //console.log(story);
            user.remove(function (err) {
                if (!err) {
                    return console.log("deleted");
                } else {
                    return console.log(err);
                }
            });

            res.json({'success':true, id:req.params.id});
        });
    });

    this.router.get('/bot', function (req, response) {
        //session storage exemple
        var images = [];
        var response_text = "";
        var options = {
                host: 'les400culs.com'
              , port: 80
              , path: '/'
              , method: 'GET'
            };

        var request = http.get(options, function(res){
            if(res.statusCode != 200) {
                  throw "Error: " + res.statusCode; 
                };
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                response_text += chunk;
            });
            res.on("end", function() {
                $ = cheerio.load(response_text);
                $("img").each(function(idx, img) {
                    //console.log(img.attribs.src);
/*
                    fs.readFile(img.attribs.src, function (err, data) {
                        var imageName = img.attribs.src;
                        console.log(err)

                        fs.writeFile(newPath, data, function (err) {
                            console.log("writeFile end, imageName : "+imageName);

                            var ass = new Ass({
                                img: imageName,
                                ratings: [],
                                average: 5,
                                reports: 0,
                                //user: 0
                            });

                            ass.save(function (err) {
                                if (!err) {
                                    console.log(ass);
                                    return console.log("ass created");
                                    //return res.json(ass);
                                } else {
                                    return console.log(err);
                                }
                            });

                            //return res.json(ass);
                            return res.json({'success':true, ass:ass});
                        });
                       
                    });
 */
                });
       
            })

        })
    });

    this.router.get('/routine', function (req, res) {
        //session storage exemple
        return res.render('routine', {
            title: 'RATE MY ASS'
        });
    });


    // DELETE ASS
    this.router.post('/routine', function(req, res, next){
        var formF = new formidable.IncomingForm({ uploadDir: path.dirname(__dirname) + '/tmp' });
            formF.parse(req, function(err, fields, files) {
                req.uploadFiles = files;
                req.fields = fields;
                console.log(files)
            });

            formF.on('progress', function(bytesReceived, bytesExpected) {
                var percent_complete = (bytesReceived / bytesExpected) * 100;
                console.log(percent_complete.toFixed(2));
            });

            formF.on('end', function (fields, files) {
                //console.log(req.uploadFiles)
console.log(req.uploadFiles)
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



                            var ass = new Ass({
                                img: imageName,
                                ratings: [],
                                average: 5,
                                reports: 0,
                                //user: 0
                            });

                            ass.save(function (err) {
                                if (!err) {
                                    console.log(ass);
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


    return this;
};


module.exports = ApiController;