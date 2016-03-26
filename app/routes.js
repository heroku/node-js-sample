// app/routes.js
var redis = require('redis');
var quizServer = require('./quizServer');
//var client = redis.createClient(6379, 'localhost');

module.exports = function(app, passport) {
    // Log time on console
    app.use(function (req, res, next) {
        var now = new Date((new Date() - 1000 * 60 * 60)).toISOString();
        console.log(now.slice(0, 10) + " " + now.slice(11, 16));
        next();
    });

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
     app.post('/login', passport.authenticate('local-login', {
         successRedirect : '/creative', // redirect to the secure profile section
         failureRedirect : '/login', // redirect back to the signup page if there is an error
         failureFlash : true // allow flash messages
     }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/creative', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
	
	
	// =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/creative',
            failureRedirect : '/'
        }));

    app.get('/frontend', function(req, res) {
        console.log("Frontend initialized");
        console.log("request: " + JSON.stringify(req.session));
        res.send('FrontEnd!');
    });

    app.get('/creative', isLoggedIn, function(req, res) {
        res.render('creative.ejs', {
            user : req.user
        });
    });

    app.get('/creative/*',function(req, res) {
        res.redirect('/creative');
    });

    app.post('/submit', function(req, res) {
        console.log("/SUBMIT", req.body.data);
        responseData = quizServer.validateAnswer(req);
        req.session.answerIndex+=1;
        console.log(req.session.answerIndex);
        responseData.questionIndex = req.session.answerIndex;
        res.send(responseData);
    });

    app.post('/quiz-select', function(req, res) {
        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({error: true, message: "invalid request", subMessage: "Please use the valid quizzes, do not try to come up with new ones :)"});
        } else {
            var selectedQuiz = req.body.data;
            console.log("selectedQuiz: " + selectedQuiz);
            res.send(quizServer.loadQuiz(selectedQuiz, req));
        }
    });

    app.post('/show-high-score', function(req, res) {
        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({error: true, message: "invalid request", subMessage: "Sorry, but I cannot show Highscore without a valid request"});
        } else {
            var quizName = req.body.data;
            console.log("Highscore for: " + quizName + " has been requested");
            res.send(quizServer.showHighScoreFor(quizName, req));
        }
    });

    app.post('/updateQuizzes', isAdmin, function(req, res) {
        console.log("updating Quizzes");
        quizServer.updateQuizzes();
        console.log("Quizzes has been updated");
        res.send("done");
    });
};


// private methods ======================================================================
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function censor(censor) {
    var i = 0;

    return function(key, value) {
        if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
            return '[Circular]';

        if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
    }
}

var isAdmin = function(req, res, next) {
    if (req.user && req.user.group === "admin")
        return next();
    res.redirect('/');
};
