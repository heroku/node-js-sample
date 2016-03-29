var express 	= require('express');
var appSecrets 	= require('./app/models/appSecrets');
var secrets = {};
var app = express();
var bodyParser 	= require('body-parser');
var passport 	= require('passport');
var flash    	= require('connect-flash');
var Promise 	= require('bluebird');
var morgan      = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var session     = require('express-session');
var mongoose	= require('mongoose');


// connect to db ===============================================================
mongoose.connect('mongodb://nodejsadmin:asdasd@ds013589.mlab.com:13589/quizzes-nodejs');
var connection = mongoose.connection;

//Promise.promisify(connection, mongoose)
//	.then(function (rows) {
//	console.log('got rows!')
//	console.dir(rows)
	//connection.end()
//})
//connectDB('mongodb://nodejsadmin:asdasd@ds013589.mlab.com:13589/quizzes-nodejs')
//	.then(getAppSecrets)
//	.then(setAppSecrets);
var a = Promise.promisify(function(){return connection.once('open')}, mongoose);
	a.then(getAppSecrets());
	a.then(setAppSecrets());

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
app.use(session({ secret: secrets.appSecret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport



// launch ======================================================================
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

// private functions ===========================================================
function getAppSecrets() {
	console.log("ASDQWEQWDEQWEQWEQW");
	return Promise.cast(mongoose.model('appsecrets').find({}).exec());
}

function setAppSecrets(err, secretsFromDB) {
	if (err) { console.error(err); }
	if (secrets && secrets.length > 0) {
		console.log("secrets exist");
		secrets = secretsFromDB;
	} else {
		console.error("err, secrets does not exists. Dieeeeeee");
		process.exit(1);
	}
}