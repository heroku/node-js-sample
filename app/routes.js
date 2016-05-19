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
    "use strict";
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

    app.get('/webhook', function (req, res) {
        if (req.query['hub_verify_token'] === 'webhook') {
            res.send(req.query['hub_challenge']);
        }
        res.send('Error, wrong validation token');
    });

    /*
     * Quiz game
     */
    app.get('/quizzes', isLoggedIn, function (req, res) {
        var user_achievements = {},
            quizzes = {};
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
                "use strict";
                Quiz.find({}, 'name category imageName', function (err, quizzesFromDB) {
                    if (err) return (err);
                    quizzes = quizzesFromDB;
                    callback();
                });
            }
        ], function (err) {
            if (err) {
                console.error(err);
                res.send({error: true, message: err});
            } else {
                res.render('quizzes.ejs', {
                    user: req.user,
                    quizzes: quizzes,
                    achievements: user_achievements
                });
            }
        });
    });

    app.post('/submit', isLoggedInV2, function (req, res) {
        console.log("/SUBMIT", req.body.data);
        if(req.session.lastAnswerIndex === req.session.answerIndex) return;
        req.session.lastAnswerIndex++;
        async.series([
            function (callback) {
                quizServer.validateAnswer(req, callback);
            }
        ], function (err) {
            if (err) {
                res.send({
                    error: true,
                    message: "Error during quiz answer validation",
                    subMessage: err
                });
            } else {
                res.send(req.session.validateAnswerResult)
            }
        });
    });

    app.post('/quiz-select', isLoggedInV2, function (req, res) {
        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "Please use the valid quizzes, do not try to come up with new ones :)"
            });
        } else {
            var selectedQuiz = req.body.data,
                quiz = {};
            async.series([
                function (callback) {
                    Quiz.findOne({'name': selectedQuiz}, function (err, result) {
                        if (err) return callback(err);
                        if (result !== null) {
                            saveQuizToSession(req, result);
                            result = removeAnswerValidityFromQuiz(result);
                            res.send(result);
                        } else {
                            callback();
                        }
                    });
                }
            ], function (err) {
                if (err) {
                    res.send({
                        error: true,
                        message: "Error during quiz retrieve",
                        subMessage: err
                    });
                } else {
                    res.send({
                            error: true,
                            message: "Quiz not found",
                            subMessage: "please try another one"
                        }
                    )
                }
            });
        }
    });

    app.post('/show-high-score', function (req, res) {
        "use strict";
        let userRequest;

        if (!req.body || !req.body.data) {
            console.log("error, invalid request");
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "Sorry, but I cannot show Highscore without a valid request"
            });
        } else {
            async.series([
                function (callback) {
                    userRequest = req.body.data;
                    quizServer.saveInSessionHighScoreFor(userRequest, req, callback);
                }
            ], function (err) {
                "use strict";
                if (err) return next(err);
                res.render('highscore_modal.ejs', {
                    scores: req.session.retrievedHighScore || [],
                    title: userRequest || "all"
                });
            });
        }
    });

    /*
     * Admin controls
     */
    app.get('/admin', isAdmin, function (req, res) {
        console.log("admin page");
        var user_achievements = [],
            quizzes = {};
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
                "use strict";
                Quiz.find({}, 'name category imageName', function (err, quizzesFromDB) {
                    if (err) return (err);
                    quizzes = quizzesFromDB;
                    callback();
                });
            }
        ], function (err) {
            if (err) return next(err);
            res.render('admin.ejs', {
                user: req.user,
                imageNames: fs.readdirSync(PATH_TO_QUIZ_IMAGES),
                achievements: user_achievements,
                quizzes: quizzes
            });
        });
    });

    app.post('/loadQuiz', isAdmin, function(req, res) {
        console.log("load quiz: ", req.body);
        if (!req.body || !req.body.selectedQuiz) {
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "quiz were not selected"
            });
            return;
        }

        Quiz.findOne({'name': req.body.selectedQuiz}, function (err, result) {
            if (err) {
                res.send({
                    error: true,
                    message: "invalid request",
                    subMessage: "quiz was not found in the database"
                });
                return;
            }
            res.send(result)
        });
    });

    app.post('/updateQuiz', isAdmin, function (req, res) {
        console.log("update quiz: ", req.body);
        if (!req.body || !req.body.selectedQuiz) {
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "quiz were not selected"
            });
            return;
        }
        let quizFromRequest = req.body.quiz;//JSON.parse(req.body.quiz);
        console.log("quizFromRequest: ", quizFromRequest);
        let validationErrors = getQuizValidationErrors(quizFromRequest);
        if (validationErrors.length > 0) {
            res.send({
                error: true,
                message: "invalid request",
                subMessage: validationErrors
            });
        }

        Quiz.findOne({'name': req.body.selectedQuiz}, function (err, result) {
            if (err) {
                res.send({
                    error: true,
                    message: "invalid request",
                    subMessage: "quiz was not found in the database"
                });
                return;
            }
            quizSeeder.updateQuiz(result, quizFromRequest, req.user);
            res.send("Quiz was successfully updated")
        });
    });

    app.post('/plus_one_question', isAdmin, function (req, res) {
        res.render('one_question_and_answers_template.ejs', {question_index: Number(req.body.question_index) + 1});
    });

    app.post('/save_one_quiz', isAdmin, function (req, res) {
        var validationErrors = getQuizValidationErrors(req.body);
        if (validationErrors.length > 0) {
            res.send({
                error: true,
                message: "invalid request",
                subMessage: validationErrors
            });
        } else {
            async.series([
                function (callback) {
                    if (!req.body.shouldOverrideExistingQuiz) {
                        Quiz.findOne({'name': req.body.name}, function (err, quiz) {
                            if (err) return callback(err);
                            if (quiz !== null) {
                                console.log("quiz already exists");
                                res.send({
                                    error: true,
                                    message: "quiz name already exists",
                                    subMessage: "Please change the name of your quiz"
                                });
                            } else {
                                callback();
                            }
                        });
                    }
                },
                function (callback) {
                    quizSeeder.seedQuizzes(req, callback);
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
        res.send("isAdmin: true (if it could be false, you would be redirected to homepage)");
    });

    app.get('/errorTemp', isAdmin, function (req, res) {
        res.send(JSON.stringify(req.session.errorTemp));
    });

    /*
     * FAQ
     */
    app.get('/faq', function (req, res) {
        res.render('faq.ejs', {
            loggedIn: req.isAuthenticated()
        });
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
                setUserRoleStateInSession(req, callback);
            }
        ], function (err) {
            if (err) return next(err);
            console.log(" req.session.roleState: ",  req.session.roleState);
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

    app.post('/update-display-name', isLoggedInV2, function (req, res) {
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

    app.post('/update-user-fast-ansers', isLoggedInV2, function (req, res) {
        var updatedUser = req.user;
        var shouldUseFastAnswers = req.body.data === "true";
        async.series([
            function (callback) {
                User.findById(req.user.id, function (err, user) {
                    if (err) return callback(err);
                    if (user === null) {
                        res.send({
                            error: true,
                            message: "Unable to update the display name",
                            subMessage: "That display name is already taken"
                        });
                        return;
                    } else {
                        updatedUser.shouldUseFastAnswers = shouldUseFastAnswers;
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

function isLoggedInV2(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.send({
        error: true,
        message: "Not logged in",
        subMessage: "please log in before using the app"
    });
}

var isAdmin = function (req, res, next) {
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role !== null && user_role.role === "admin") {
                        return next();
                    } else {
                        res.redirect('/');
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

function getQuizValidationErrors(data) {
    "use strict";
    let answers = [],
        questions = [],
        points = [],
        validationErrors = "";
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
    if (!data) {
        validationErrors = "<p>quiz data was not provided at all.</p>";
    }
    if (!validator.isAscii(data.name)) {
        validationErrors += "<p>quiz name contained not valid chars. Please check that.</p>";
    }
    if (!validator.isAscii(data.category)) {
        validationErrors += "<p>category contained invalid chars. Please check that.</p>";
    }

    if (!validator.isBoolean(data.gamePlayTimeBased)) {
        validationErrors += "<p>Time based gameplay was not provided. Please check that (tick/untick... this is a weird error... it's onlya a boolean flag :)).</p>";
    }
    if (!validator.isBoolean(data.pointCalculationTimeBased)) {
        validationErrors += "<p>Time based point calculation was not provided. Please check that (tick/untick... this is a weird error... it's onlya a boolean flag :)).</p>";
    }
    if (!validator.isBoolean(data.questionsShouldBeRandomlyOrdered)) {
        validationErrors += "<p>Random question order was not provided. Please check that (tick/untick... this is a weird error... it's onlya a boolean flag :)).</p>";
    }
    if (!validator.isBoolean(data.answersShouldBeRandomlyOrdered)) {
        validationErrors += "<p>Random answer order was not provided. Please check that (tick/untick... this is a weird error... it's onlya a boolean flag :)).</p>";
    }

    if (questions.some(elem => elem.length < 1)) {
        validationErrors += "<p>One or more question is not filled in. Please provide the question.</p>";
    }
    if (questions.some(elem => !validator.isAscii(elem))) {
        validationErrors += "<p>One or more question contains invalid chars. Please check them.</p>";
    }
    if (answers.some(elem => elem.length < 1)) {
        validationErrors += "<p>One or more answer is not filled in. Please provide the question.</p>";
    }
    if (answers.some(elem => !validator.isAscii(elem))) {
        validationErrors += "<p>One or more answer contains invalid chars. Please check them.</p>";
    }
    if (points.some(elem => elem.length !== 0 && !Number.isInteger(Number(elem)))) {
        validationErrors += "<p>One or more point either should be left empty or should be a number. Pleasecheck them.</p>";
    }

    return validationErrors;
}

function saveQuizToSession(req, result) {
    "use strict";
    req.session.quizName = result.name;
    req.session.answerIndex = 0;
    req.session.lastAnswerIndex = -1;
    req.session.score = 0;
    req.session.pointCalculationTimeBased = result.pointCalculationTimeBased;
    req.session.gamePlayTimeBased = result.gamePlayTimeBased;
    req.session.questionsShouldBeRandomlyOrdered = result.questionsShouldBeRandomlyOrdered;
    req.session.answersShouldBeRandomlyOrdered = result.answersShouldBeRandomlyOrdered;
    req.session.questionsAndAnswers = result.questionsAndAnswers;
    req.session.quizLength = result.questionsAndAnswers.length;
    req.session.startTimeStamp = new Date().getTime();
}

function removeAnswerValidityFromQuiz(quiz) {
    "use strict";
    for (let index = 0; index < quiz.questionsAndAnswers.length; index++) {
        quiz.questionsAndAnswers[index].answers.valid = "";
        quiz.questionsAndAnswers[index].answers.point = "";
    }
    return quiz;
}
