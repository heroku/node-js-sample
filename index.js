var express 	= require('express');
var helmet = require('helmet');
var async = require("async");
var bodyParser 	= require('body-parser');
var passport 	= require('passport');
var flash    	= require('connect-flash');
var morgan      = require('morgan');
var cookieParser = require('cookie-parser');
var session     = require('express-session');
require('./config/mongoModule');
require('./config/passport')(passport);

var app = express();
app.set('port', (process.env.PORT || 5000));
app.set('appSecret', (process.env.APP_SECRET || "itsNotASecretAnyMore"));
app.use(helmet());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('common')); // log every request to the console
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(session({ secret: app.get('appSecret')}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes ======================================================================
require('./app/routes.js')(app, passport);

// launch ======================================================================
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});
