var fs = require('fs');

var async = require("async");
var UserAchievement = require('./../models/userAchievement');
var Quiz = require('./../models/quiz');
var User = require('./../models/user');
var Role = require('./../models/role');
var quizSeeder = require('./../quizSeeder');

var PATH_TO_QUIZ_IMAGES = './public/img/quizzes';

module.exports = function (app, passport, middlewares) {
    "use strict";
    /*
     * Admin controls
     */
    app.all('/admin/*', middlewares.isAdmin, function (req, res, next) {
        next();
    });

    app.get('/admin/home', function (req, res) {
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

    app.post('/admin/loadQuiz', middlewares.isAdmin, function (req, res) {
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

    app.post('/admin/updateQuiz', middlewares.isAdmin, function (req, res) {
        console.log("update quiz: ", req.body);
        if (!req.body || !req.body.selectedQuiz) {
            res.send({
                error: true,
                message: "invalid request",
                subMessage: "quiz were not selected"
            });
            return;
        }
        let quizFromRequest = req.body.quiz;
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
            res.send("Quiz was successfuly updated")
        });
    });

    app.post('/admin/plus_one_question', middlewares.isAdmin, function (req, res) {
        res.render('one_question_and_answers_template.ejs', {question_index: Number(req.body.question_index) + 1});
    });

    app.post('/admin/save_one_quiz', middlewares.isAdmin, function (req, res) {
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

    app.get('/admin/users', function (req, res) {
        let users = {},
            roles = {},
            usersAndRoles = [];
        async.series([
            function (callback) {
                User.find({}, 'displayName _id', function (err, usersFromDB) {
                    if (err) return (err);
                    users = usersFromDB;
                    callback();
                });
            },
            function (callback) {
                Role.find({}, function (err, roleFromDB) {
                    if (err) return callback(err);
                    roles = roleFromDB;
                    callback();
                });
            },
            function (callback) {
                for (let userIndex in users) {
                    usersAndRoles[userIndex] = {};
                    for (let role of roles) {
                        if (role.userId === users[userIndex].id) {
                            usersAndRoles[userIndex].displayName = users[userIndex].displayName;
                            usersAndRoles[userIndex].id = users[userIndex].id;
                            usersAndRoles[userIndex].role = role.role;
                            usersAndRoles[userIndex].team = role.team;
                        }
                    }
                }
                callback();
            }
        ], function (err) {
            if (err) return next(err);
            res.send(usersAndRoles);
        });
    });

    app.post('/admin/update/users', function (req, res) {
        let users = JSON.parse(req.body.data);
        async.series([
            function (callback) {
                let index = users.length;
                for (let user of users) {
                    User.findOne({_id: user.userId}, user, function (err, userFromDB) {
                        if (err) return (err);
                        console.log('The raw response from Mongo was ', userFromDB);
                        if (userFromDB == null) {
                            return;
                        }
                        userFromDB.displayName = user.name;
                        userFromDB.save(function (err) {
                            if (err) res.send({
                                error: true,
                                message: "unable to save the user to db",
                                subMessage: "reason: " + err
                            });
                            index--;

                            if (index === 0) {  // last user is updated
                                callback();
                            }
                        });
                    });
                }
            },
            function (callback) {
                let index = users.length;
                for (let user of users) {
                    Role.findOne({userId: user.userId}, user, function (err, roleFromDB) {
                        if (err) return (err);
                        console.log('The raw response from Mongo was ', roleFromDB);
                        if (roleFromDB == null) {
                            return;
                        }
                        roleFromDB.role = user.role;
                        roleFromDB.team = user.team;
                        roleFromDB.save(function (err) {
                            if (err) res.send({
                                error: true,
                                message: "unable to save the role to db",
                                subMessage: "reason: " + err
                            });
                            index--;

                            if (index === 0) {  // last role is updated
                                callback();
                            }
                        });
                    });
                }
            },
        ], function (err) {
            if (err) return next(err);
            res.send({success: true});
        });

    });

    app.post('/admin/delete/users', function (req, res) {
        let users = JSON.parse(req.body.data);
        async.series([
            function (callback) {
                let index = users.length;
                for (let user of users) {
                    User.findOne({_id: user.userId}, user, function (err, userFromDB) {
                        if (err) return (err);
                        console.log('The raw response from Mongo was ', userFromDB);
                        if (userFromDB == null) {
                            return;
                        }
                        userFromDB.remove(function (err) {
                            if (err) res.send({
                                error: true,
                                message: "unable to remove the user from db",
                                subMessage: "reason: " + err
                            });
                            index--;

                            if (index === 0) {  // last user is removed
                                callback();
                            }
                        });
                    });
                }
            },
            function (callback) {
                let index = users.length;
                for (let user of users) {
                    Role.findOne({userId: user.userId}, user, function (err, roleFromDB) {
                        if (err) return (err);
                        console.log('The raw response from Mongo was ', roleFromDB);
                        if (roleFromDB == null) {
                            return;
                        }
                        roleFromDB.remove(function (err) {
                            if (err) res.send({
                                error: true,
                                message: "unable to remove the role from db",
                                subMessage: "reason: " + err
                            });
                            index--;

                            if (index === 0) {  // last role is updated
                                callback();
                            }
                        });
                    });
                }
            },
        ], function (err) {
            if (err) return next(err);
            res.send({success: true});
        });

    });

};

function getQuizValidationErrors(data) {
    "use strict";
    let answers = [],
        questions = [],
        points = [],
        validationErrors = "";
    for (let key in data) {
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
