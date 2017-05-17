var express 	= require('express');
var helmet = require('helmet');
var async = require("async");
var bodyParser 	= require('body-parser');
var passport 	= require('passport');
var flash    	= require('connect-flash');
var morgan      = require('morgan');
var cookieParser = require('cookie-parser');
var session     = require('express-session');

var middlewares = require('./app/middlewares.js');
var sessionHelper = require('./app/sessionHelper.js');
var app = express();

require('./config/mongoModule');
require('./config/passport')(passport);

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
require('./app/routes/tools.js')(app, middlewares);
require('./app/routes/routes.js')(app, middlewares);
require('./app/routes/authentication.js')(app, passport, middlewares, sessionHelper);
require('./app/routes/facebookRoutes.js')(app);
require('./app/routes/quizRoutes.js')(app, passport, middlewares);
require('./app/routes/adminRoutes.js')(app, passport, middlewares);
require('./app/routes/challengeRoutes.js')(app, passport, middlewares, sessionHelper);

// launch ======================================================================
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});
