var express = require('express');

	var User = require('./app/models/user'); // TODO remove
	
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var mongoose	 = require('mongoose');
require('./config/passport')(passport);

app.set('port', (process.env.PORT || 5000));
app.set('database_url', (process.env.DATABASE_URL || "TODOLocalDatabaseURL"));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'thisIsReallyASecretButIWillTellYou' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// connect to db ===============================================================
mongoose.connect('mongodb://nodejsadmin:asdasd@ds013589.mlab.com:13589/quizzes-nodejs');
var connection = mongoose.connection;

connection.once('open', function() {
  console.log("connected to mongodb successfully.");
  // find each person with a last name matching 'Ghost'
	User.findOne({ 'local.email' :  "email@email.com" }, function(err, user) {
		if (err) {
			console.error(err);
		}
		if (user) {
			console.log("user exists");
			console.log(JSON.stringify(user));
		} else {
			var newUser = new User();

			// set the user's local credentials
			newUser.local.email    = "email@email.com";
			newUser.local.password = newUser.generateHash("password");

			// save the user
			newUser.save(function(err) {
				if (err)
					console.error(err);
			});
		}
	});
});

// launch ======================================================================
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
