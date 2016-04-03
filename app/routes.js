var quizServer = require('./quizServer');
var async = require("async");
var User = require('./models/user');
var Roles = require('./models/role');
var UserAchievement = require('./models/userAchievement');
var Quiz = require('./models/quiz');
var quizSeeder = require('./quizSeeder');
var validator = require('validator');

var fs = require('fs');

var PATH_TO_QUIZ_IMAGES = './public/img/quizzes';
var REDIRECT_TO_PROFILE = '/profile';
var REDIRECT_TO_QUIZZES = '/quizzes';

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
    app.get('/quizzes', isLoggedIn, function (req, res) {
        res.render('quizzes.ejs', {
            user: req.user,
            quizzes: quizServer.getQuizzes()
        });
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

    /*
     * Admin controls
     */
    app.get('/admin', isAdmin, function (req, res) {
        console.log("admin page");
        var user_achievements = [];
        async.series([
            function (callback) {
                UserAchievement.findOne({'userId': req.user.id}, function (err, achievements) {
                    if (err) return callback(err);
                    if (achievements !== null) {
                        user_achievements = achievements.achievements;
                    }
                    callback();
                });
            }
        ], function (err) {
            if (err) return next(err);
            res.render('admin.ejs', {
                user: req.user,
                imageNames: fs.readdirSync(PATH_TO_QUIZ_IMAGES),
                achievements: user_achievements
            });
        });
    });

    app.post('/updateQuizzes', isAdmin, function (req, res) {
        console.log("updating Quizzes");
        quizServer.updateQuizzes();
        console.log("Quizzes has been updated");
        res.send("done");
    });

    app.post('/plus_one_question', isAdmin, function (req, res) {
        res.render('one_question_and_answers_template.ejs', {question_index: Number(req.body.question_index) + 1});
    });

    app.post('/save_one_quiz', isAdmin, function (req, res) {
        if (quizIsNotValid(req.body)) {
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "Please make sure the quiz is valid (all the mandatory fields are filled in)"
            });
        } else {
            async.series([
                function (callback) {
                    console.log("series start");
                    if (!req.body.shouldOverrideExistingQuiz) {
                        Quiz.findOne({'name': req.body.name}, function (err, quiz) {
                            console.log("quiz [findone]: " + quiz);

                            if (err) return callback(err);
                            if (quiz !== null) {
                                console.log("quiz already exists");
                                res.send({
                                    error: true,
                                    message: "quiz name already exists",
                                    subMessage: "Please change the name of your quiz"
                                });
                            } else {
                                console.log("ide azért belefut, csak szemétkedik");
                                callback();
                            }
                        });
                    }
                },
                function (callback) {
                    console.log("na ezt nem szabadna előbb látni mint az ide azért belefutot");
                    quizSeeder.seedQuizzes(req.body, callback);
                }
            ], function (err) {
                console.log(err);
                console.log(JSON.stringify(err));
                if (err) return res.send({error: err});
                res.send({error: false});
            });
        }
    });

    /*
     * Useful tools
     */
    app.use(function (req, res, next) {
        var now = new Date((new Date() - 1000 * 60 * 60)).toISOString();
        console.log(now.slice(0, 10) + " " + now.slice(11, 16));
        next();
    });

    app.get('/isSandbox', function (req, res) {
        res.send("isSandbox: " + (app.get("appSecret") === "itsNotASecretAnyMore"));
    });

    app.get('/isAdmin', isAdmin, function (req, res) {
        res.send("isAdmin: true (if it qould be false, you would be redirected to homepage)");
    });

    app.get('/errorTemp', isAdmin, function (req, res) {
        res.send(JSON.stringify(req.session.errorTemp));
    });

    /*
     * Authentication
     */
    app.post('/login',
        passport.authenticate('local-login', {
            successRedirect: REDIRECT_TO_PROFILE,
            failureRedirect: '/',
            failureFlash: true
        })
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        var user_achievements = [];
        var admin = false;
        async.series([
            function (callback) {
                UserAchievement.findOne({'userId': req.user.id}, function (err, achievements) {
                    if (err) return callback(err);
                    if (achievements !== null) {
                        user_achievements = achievements.achievements;
                    }
                    callback();
                });
            },
            function (callback) {
                if (req.session.roleState) {
                    callback();
                } else {
                    setUserRoleStateInSession(req, callback);
                }
            }
        ], function (err) {
            if (err) return next(err);
            res.render('profile.ejs', {
                user: req.user,
                admin: req.session.roleState,
                achievements: user_achievements
            });
        });
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: REDIRECT_TO_PROFILE,
            failureRedirect: '/'
        })
    );

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: REDIRECT_TO_PROFILE,
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
                    if (user_role === null || user_role.role === "admin") {
                        return next();
                    }
                    callback();
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

var setUserRoleStateInSession = function (req, cb) {
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role !== null) {
                        req.session.roleState = user_role.role;
                    } else {
                        req.session.roleState = "guest";
                    }
                    callback();
                });
            } else {
                callback();
            }
        }
    ], function () {
        cb();
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

function quizIsNotValid(data) {
    "use strict";
    let answers = [],
        questions = [],
        points = [];
    for (key in data) {
        if (data.hasOwnProperty(key)) {
            if (key.startsWith("answer_")) {
                answers.push(data[key]);
            }
            if (key.startsWith("question_")) {
                questions.push(data[key]);
            }
            if (key.startsWith("points_")) {
                points.push(data[key]);
            }
        }
    }
    console.log(!data);
    console.log(!validator.isAscii(data.name));
    console.log(!validator.isAscii(data.category));
    console.log(!validator.isBoolean(data.gamePlayTimeBased));
    console.log(!validator.isBoolean(data.pointCalculationTimeBased));
    console.log(!validator.isBoolean(data.questionsShouldBeRandomlyOrdered));
    console.log(!validator.isBoolean(data.answersShouldBeRandomlyOrdered));
    console.log(questions.some(elem => elem.length < 1));
    console.log(questions.some(elem => !validator.isAscii(elem)));
    console.log(answers.some(elem => elem.length < 1));
    console.log(answers.some(elem => !validator.isAscii(elem)));
    console.log(points.some(elem => elem.length !== 0 && !Number.isInteger(Number(elem))));

    return !!(
    !data || !validator.isAscii(data.name) || !validator.isAscii(data.category) || !validator.isBoolean(data.gamePlayTimeBased) || !validator.isBoolean(data.pointCalculationTimeBased) || !validator.isBoolean(data.questionsShouldBeRandomlyOrdered) || !validator.isBoolean(data.answersShouldBeRandomlyOrdered) ||
    questions.some(elem => elem.length < 1) ||
    questions.some(elem => !validator.isAscii(elem)) ||
    answers.some(elem => elem.length < 1) ||
    answers.some(elem => !validator.isAscii(elem)) ||
    points.some(elem => elem.length !== 0 && !Number.isInteger(Number(elem)))
    );

}