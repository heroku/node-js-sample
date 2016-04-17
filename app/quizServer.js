var User = require('./models/user');
var exports = module.exports = {};
var Highscore = require('./models/highscore');
var async = require('async');

exports.validateAnswer = function (req, callback) {
    "use strict";
    let validateAnswerResult = {
        'scoreUp': 0,
        'gameFinished': false,
        'name': req.session.quizName,
        'questionIndex': req.session.answerIndex + 1
    };
    let shouldCallback = true;
//    console.log(JSON.stringify(req.session));
    req.session.validateAnswerResult = validateAnswerResult;
    if (!isAnswerIndexValid(req)) {
        validateAnswerResult.gameFinished = true;
    } else if (wasTheAnswerCorrect(req)) {
        validateAnswerResult.scoreUp = req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data].point;
        req.session.score += validateAnswerResult.scoreUp;
        validateAnswerResult.gameFinished = isAnswerIndexTheLast(req.session);
        if (validateAnswerResult.gameFinished) {
            saveHighScore(req, callback);
            shouldCallback = false;
        }
    }
    req.session.answerIndex++;
    if (shouldCallback) {
        callback();
    }
};

exports.saveInSessionHighScoreFor = function (quizName, req, cb) {
    "use strict";
    req.session.retrievedHighScore = [];
    async.series([
        function (callback) {
            if (quizName === "all") {
                Highscore.find({}, function (err, result) {
                    if (err) return callback(err);
                    pushRetrievedHighScoreInToSession(req, result, 0, callback);
                });
            } else {
                Highscore.findOne({'quizName': quizName}, function (err, result) { // TODO: consider, do we even need it?
                    if (err) return callback(err);
                    req.session.retrievedHighScore = result;
                    callback();
                });
            }
        }
    ], function (err) {
        cb(err);
    });
};

function pushRetrievedHighScoreInToSession(req, highScores, index, cb) {
    "use strict";
    if (!highScores[index]) {
        cb();
        return;
    }
    async.series([
        function (callback) {
            User.findById(highScores[index].userId, function (err, user) {
                if(user) {
                    let highScoreEntry = {
                        user: user.displayName,
                        score: highScores[index].score,
                        date: highScores[index].dateTime,
                        quizName: highScores[index].quizName
                    };
                    req.session.retrievedHighScore.push(highScoreEntry);
                }
                callback();
            });
        }], function (err) {
            pushRetrievedHighScoreInToSession(req, highScores, index+1, cb);
    });
}

function isAnswerIndexValid(req) {
    return req.session.questionsAndAnswers && req.session.questionsAndAnswers[req.session.answerIndex];
}

function isAnswerIndexTheLast(session) {
    return session.quizLength === session.answerIndex + 1;
}

function wasTheAnswerCorrect(req) {
    return req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data] &&
        req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data].valid;
}

function noAnswerWereSubmitted(req) {
    return req.body.data.length === 0;
}


function saveHighScore(req, cb) {
    "use strict";
    async.series([
        function (callback) {
            saveNewScore(req, callback);
        }
    ], function (err) {
        cb(err);
    });
}

function updateUserScoreIfBetter(result, req, callback) {
    "use strict";
    if (result.score < req.session.score) {
        saveNewScore(req, callback, result);
    }
    callback();
}

function saveNewScore(req, callback, result) {
    "use strict";
    var highscore = result || new Highscore();
    highscore.quizName = req.session.quizName;
    highscore.userId = req.user.id;
    highscore.score = req.session.score;
    highscore.save(function (err) {
        if (err) return callback(err);
    });
    callback();
}

function isObjectEmpty(o) {
    return Object.getOwnPropertyNames(o).length === 0;
}
