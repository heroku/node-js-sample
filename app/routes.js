var quizServer = require('./quizServer');
var async = require("async");
var User = require('../app/models/user');
var Roles = require('../app/models/role');

var REDIRECT_TO_PROFILE = '/profile';
var REDIRECT_TO_QUIZZES = '/creative';

module.exports = function (app, passport) {
    /*
     * Home page
     */
    app.get('/', function (req, res) {
        if (req.user) {
            res.redirect(REDIRECT_TO_QUIZZES);
        } else {
            res.render('index.ejs', {
                message: req.flash('loginMessage'),
                shouldShowThirdPartyLogins: (!req.user || (req.user && (!req.user.facebook.token || !req.user.twitter.token))),
                shouldShowFacebookLogin: (!req.user || (req.user && !req.user.facebook.token)),
                shouldShowTwitterLogin: (!req.user || (req.user && !req.user.twitter.token))
            });
        }
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

    app.get('/isAdmin', isAdmin, function (request, response) {
        response.send("isAdmin: true (if it qould be false, you would be redirected to homepage)");
    });

    /*
     * Authentication
     */
    app.post('/login',
        passport.authenticate('local-login', {
            successRedirect: REDIRECT_TO_QUIZZES,
            failureRedirect: '/',
            failureFlash: true
        })
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {user: req.user});
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: REDIRECT_TO_QUIZZES,
            failureRedirect: '/'
        })
    );

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: REDIRECT_TO_QUIZZES,
            failureRedirect: '/'
        })
    );

    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: REDIRECT_TO_PROFILE,
            failureRedirect: '/'
        })
    );
    app.get('/connect/callbackURL',
        passport.authorize('facebook', {
            successRedirect: REDIRECT_TO_PROFILE,
            failureRedirect: '/'
        })
    );

    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: REDIRECT_TO_PROFILE,
            failureRedirect: '/'
        })
    );

    app.get('/unlink/local', function (req, res) {
        var user = req.user;
        user.local.name = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect(REDIRECT_TO_PROFILE);
        });
    });

    app.get('/unlink/facebook', function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect(REDIRECT_TO_PROFILE);
        });
    });

    app.get('/unlink/twitter', function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.twitter.profilePhoto = undefined;
        user.save(function (err) {
            res.redirect(REDIRECT_TO_PROFILE);
        });
    });

    app.post('/update-display-name', isLoggedIn, function (req, res) {
        var updatedUser = req.user;
        var newDisplayName = req.body.data.trim();
        if (!newDisplayName || newDisplayName === "") {
            res.send({
                error: true,
                message: "New display Name was not given",
                subMessage: "Please provide a new name"
            });
            return;
        }
        async.series([
            function (callback) {
                User.findOne({'displayName': newDisplayName}, function (err, user) {
                    if (err) return callback(err);
                    if (user === null) {
                        updatedUser.displayName = newDisplayName;
                    } else {
                        res.send({
                            error: true,
                            message: "Unable to update the display name",
                            subMessage: "That display name is already taken"
                        });
                        return;
                    }
                    callback();
                });
            }
        ], function (err) {
            if (err) return next(err);
            updatedUser.save(function (err) {
                if (err) res.send({
                    error: true,
                    message: "unable to save the user to db",
                    subMessage: "reason: " + err
                });
                res.send({error: false});
            });
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

var isAdmin = function (req, res, next) {
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role === null || user_role.role !== "admin") {
                        res.redirect('/');
                    }
                    return next();
                });
            } else {
                callback();
            }
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/');
    });
};

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
