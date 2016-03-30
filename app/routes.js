var quizServer = require('./quizServer');

module.exports = function (app, passport) {
    /*
     * Home page
     */
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    /*
     * Quiz game
     */
    app.get('/creative', isLoggedIn, function (req, res) {
        res.render('creative.ejs', {
            user: req.user,
            quizzes: quizServer.getQuizzes()
        });
    });

    app.get('/creative/*', function (req, res) {
        res.redirect('/creative');
    });

    app.post('/submit', function (req, res) {
        console.log("/SUBMIT", req.body.data);
        responseData = quizServer.validateAnswer(req);
        req.session.answerIndex += 1;
        console.log(req.session.answerIndex);
        responseData.questionIndex = req.session.answerIndex;
        res.send(responseData);
    });

    app.post('/quiz-select', function (req, res) {
        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "Please use the valid quizzes, do not try to come up with new ones :)"
            });
        } else {
            var selectedQuiz = req.body.data;
            console.log("selectedQuiz: " + selectedQuiz);
            res.send(quizServer.loadQuiz(selectedQuiz, req));
        }
    });

    app.post('/show-high-score', function (req, res) {
        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "Sorry, but I cannot show Highscore without a valid request"
            });
        } else {
            var quizName = req.body.data;
            console.log("Highscore for: " + quizName + " has been requested");
            res.send(quizServer.showHighScoreFor(quizName, req));
        }
    });

    app.post('/updateQuizzes', isAdmin, function (req, res) {
        console.log("updating Quizzes");
        quizServer.updateQuizzes();
        console.log("Quizzes has been updated");
        res.send("done");
    });

    /*
     * Useful tools
     */
    app.use(function (req, res, next) {
        var now = new Date((new Date() - 1000 * 60 * 60)).toISOString();
        console.log(now.slice(0, 10) + " " + now.slice(11, 16));
        next();
    });

    app.get('/isSandbox', function (request, response) {
        response.send("isSandbox: " + (app.get("appSecret") === "itsNotASecretAnyMore"));
    });

    /*
     * Authentication
     */
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });
    app.post('/signup', passport.authenticate('local-login', {
        successRedirect: '/creative',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/login', function (req, res) {
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });
    app.post('/login',
        passport.authenticate('local-login', {
            successRedirect: '/creative',
            failureRedirect: '/login',
            failureFlash: true })
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', { user: req.user });
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        })
    );

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/creative',
            failureRedirect: '/'
        })
    );

    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local',
        passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/connect/local',
            failureFlash : true })
    );
    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        })
    );
    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/' })
    );

    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
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

    return function (key, value) {
        if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
            return '[Circular]';

        if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
    }
}

var isAdmin = function (req, res, next) {
    if (req.user && req.user.group === "admin")
        return next();
    res.redirect('/');
};
