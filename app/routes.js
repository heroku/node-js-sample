// app/routes.js
var fs = require('fs');

module.exports = function(app, passport) {
    // Log time on console
    app.use(function (req, res, next) {
        var now = new Date().toISOString();
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

    app.get('/frontend', isLoggedIn, function(request, response) {
        response.send('FrontEnd!');
        console.log("Frontend initialized");
        console.log("request: " + request.body);
    });

    app.get('/creative', isLoggedIn, function(req, res) {
        res.render('creative.ejs', {
            user : req.user
        });
    });

    app.get('/creative/*',function(req, res) {
        res.redirect('/creative');
    });

    app.post('/submit', function(request, response) {
        response.send('{data: "tbd"}');
        console.log("/SUBMIT");
        console.log("request: " + JSON.stringify(request.body, censor(request.body)));
    });

    app.post('/quiz-select', function(request, response) {
        console.log("/quiz-select");
        if (!request.body || !request.body.data) {
            console.log("error, invalid request");
            response.send({error: true, message: "invalid request", subMessage: "Please use the valid quizzes, do not try to come up with new ones :)"});
        } else {
            var selectedQuiz = request.body.data;
            console.log("selectedQuiz: " + selectedQuiz);
            response.send(loadQuiz(selectedQuiz));
        }
    })
};



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// private methods ======================================================================
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

function loadQuiz(selectedQuiz) {
    var quiz;
    switch (selectedQuiz) {
        case "javascript": quiz = JSON.parse(fs.readFileSync('json/javascriptQuiz.json', 'utf8')); break;
        case "jdk8": quiz = JSON.parse(fs.readFileSync('json/jdk8Quiz.json', 'utf8')); break;
        case "jdk9": quiz = JSON.parse(fs.readFileSync('json/jdk9Quiz.json', 'utf8')); break;
        case "freemarker": quiz = JSON.parse(fs.readFileSync('json/freemarkerQuiz.json', 'utf8')); break;
        default : return {error: true, message: "Invalid quiz request", subMessage: "the requested quiz unfortunately not exists yet. Come back later!"};
    }
    return quiz;
}
