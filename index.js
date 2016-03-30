var express 	= require('express');
var async = require("async");
var appSecrets 	= require('./app/models/appSecrets');
var mongoose = require('mongoose');
var bodyParser 	= require('body-parser');
var passport 	= require('passport');
var flash    	= require('connect-flash');
var morgan      = require('morgan');
var cookieParser = require('cookie-parser');
var session     = require('express-session');
var mongooseConnection = require('./config/mongoModule');
require('./config/passport')(passport);

var secrets = {};
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('appSecret', (process.env.APP_SECRET || "itsNotASecretAnyMore"));
app.set('database_url', (process.env.DATABASE_URL || "TODOLocalDatabaseURL"));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
async.series([
    //function(callback) {
    //    appSecrets.findOne({}, "appSecret", function(err, obj) {
        //    secrets.appSecret = obj.get("appSecret");
        //    callback();
        //});
    //},
    function(callback) {
        app.use(session({ secret: app.get('appSecret')})); // session secret
        app.use(passport.initialize());
        app.use(passport.session()); // persistent login sessions
        app.use(flash()); // use connect-flash for flash messages stored in session

        // routes ======================================================================
        require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

        // launch ======================================================================
        app.listen(app.get('port'), function() {
            console.log("Node app is running at localhost:" + app.get('port'));
        });
        callback();
    }
], function(err) { //This function gets called after the two tasks have called their "task callbacks"
    if (err) return next(err);
    console.log("last series");
});
