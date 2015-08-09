var Oauth2Controller = function (rapido) {
    var express = require('express');
    this.router = express.Router();

    var checkLogin = function (req, res, next) {
        if (!req.user) {
            req.session.nextUrl = req.originalUrl;
            return res.redirect('/security/login');
        }
        return next();
    };

    /**
     * Request a authorization process from a client
     * Display a form to the end user. If user accept
     */
    var oauth2Authorization = rapido.oauth2Server.authorization(function (clientID, redirectURI, done) {
        var clientReq = {key: clientID};
        rapido.getModel('oauth2.client').findOne(clientReq, function (err, localClient) {
            if (err) {
                return done(err);
            }
            if (!localClient) {
                return done(null, false);
            }
            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectURI provided by the client matches one registered with
            //          the server.  For simplicity, this example does not.  You have
            //          been warned.
            //store the redirect url on the client also

            return done(null, localClient, redirectURI);
        });
    });
    var authorize = [
        checkLogin,
        oauth2Authorization,
        function (req, res, next) {
            return res.render('oauth2/authorization', {
                transactionID: req.oauth2.transactionID,
                user: req.user,
                client: req.oauth2.client,
                formAction: req.baseUrl + '/dialog/authorize/decision'
            });
        }
    ];
    this.router.get('/dialog/authorize', authorize);

    /**
     * Listen ofr the user decision to authorize the specific client to get a code with redirect URI
     */
    this.router.post('/dialog/authorize/decision', checkLogin, rapido.oauth2Server.decision());

    /**
     * Issue a token to client of user depending on request
     */
    this.router.all('/token', [
        //pass the query to body
        function (req, res, next) {
            require('util')._extend(req.body, req.query);
            next();
        },
        rapido.passport.authenticate(['oauth2-client-password'], {session: false}),
        rapido.oauth2Server.token(),
        rapido.oauth2Server.errorHandler()
    ]);
    return this;
};
module.exports = Oauth2Controller;