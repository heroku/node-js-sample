var async = require("async");
var quizServer = require('./../quizServer');
var UserAchievement = require('./../models/userAchievement');
var Quiz = require('./../models/quiz');

var validator = require('validator');

module.exports = function (app, passport, middlewares) {
    "use strict";
    /*
     * Quiz game
     */
    app.get('/quizzes', middlewares.isLoggedIn, function (req, res) {
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

    app.post('/submit', middlewares.isLoggedInV2, function (req, res) {
        console.log("/SUBMIT", req.body.data);
        if (req.session.lastAnswerIndex === req.session.answerIndex) return;
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

    app.post('/quiz-select', middlewares.isLoggedInV2, function (req, res) {
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

};

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


