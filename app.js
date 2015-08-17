/***********************************************************
 * 
 * 
 *  ____|_  ___ __  _ __ ___  ___ ___|  _ \ __ _ _ __ (_) __| | ___  
 *|  _| \ \/ / '_ \| '__/ _ \/ __/ __| |_) / _` | '_ \| |/ _` |/ _ \ 
 *| |___ >  <| |_) | | |  __/\__ \__ \  _ < (_| | |_) | | (_| | (_) |
 *|_____/_/\_\ .__/|_|  \___||___/___/_| \_\__,_| .__/|_|\__,_|\___/ 
 *           |_|                                |_|                  
 *
 * Extend an express application with a Rapido micro framework
 * 
 ***********************************************************/
var ExpresRapido = require('express-rapido');
var app = require('express')();
var config = require('config');
var rapido = new ExpresRapido(app, config);

var path = require('path');

rapido.log('----- Start Init ------');

//load modules
rapido
        .getModule('db').init()
        .getModule('session').init()
        .getModule('i18n').init()
        .getModule('views').init()
        //extra security
        .getModule('security').init()
        .getModule('securityLocal').init()
        .getModule('securityBasic').init()
        //extra oauth2
        .getModule('securityBearer').init()
        .getModule('securityOauth2ClientPassword').init()
        .getModule('socket.io').init()
        .getModule('server').oauth2Server.init();



//magic register a controller 
//register a route
//attach the whole thing to the path
rapido.registerControllerAndAttachToRoute('default', '/', __dirname + '/controllers/default.js');
rapido.registerControllerAndAttachToRoute('api', '/api', __dirname + '/controllers/api.js');

//extra security
rapido.registerControllerAndAttachToRoute('security', '/security', __dirname + '/controllers/security.js');
//extra oauth2
rapido.registerControllerAndAttachToRoute('oauth2', '/oauth2', __dirname + '/controllers/oauth2.js');

var root = path.dirname(process.mainModule.filename);
rapido.registerModel('ass', root+'/models/ass.js');

//test socket io
rapido.io.on('connection', function (socket) {
    socket.broadcast.emit('changeColor', {color: '#'+Math.floor(Math.random()*16777215).toString(16) });
});

rapido.log('----- End Init ------');
rapido.boot();

module.exports = rapido;