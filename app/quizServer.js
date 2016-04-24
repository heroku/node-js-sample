var User = require('./models/user');
var exports = module.exports = {};
var Highscore = require('./models/highscore');
var Quiz = require('./models/quiz');
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

    req.session.validateAnswerResult = validateAnswerResult;
    if (wasTheAnswerCorrect(req)) {
        let timeStampDiff = new Date().getTime() - req.session.startTimeStamp;
        req.session.startTimeStamp = new Date().getTime();

        if (req.session.gamePlayTimeBased) {
            validateAnswerResult.scoreUp = req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data].point / calculateScoreDivisor(timeStampDiff);
        } else {
            validateAnswerResult.scoreUp = req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data].point;
        }

        req.session.score += validateAnswerResult.scoreUp;
    }

    validateAnswerResult.gameFinished = isAnswerIndexTheLastOrInvalid(req.session);
    if (validateAnswerResult.gameFinished) {
        saveHighScore(req, callback);
        shouldCallback = false;
    }
    req.session.answerIndex++;
    if (shouldCallback) {
        callback();
    }
};

exports.saveInSessionHighScoreFor = function (quizName, req, cb) {
    "use strict";
    let quizNames = [];
    req.session.retrievedHighScore = [];
    req.session.parallelIndex = 0;

    async.series([
        function (callback) {
            Quiz.find({})
                .select("name")
                .exec( function (err, result) {
                if (err) return callback(err);
                quizNames = Array.from(result, quiz => quiz.name);
                callback();
            });
        },
        function (callback) {
            let quizNamesLength = quizNames.length;
            for (let quizIndex = 0; quizIndex < quizNamesLength; quizIndex++) {
                Highscore
                    .find({quizName : quizNames[quizIndex]})
                    .sort({score: -1})
                    .limit(10)
                    .exec( function (err, result) {
                        if (err) return callback(err);
                        pushRetrievedHighScoreInToSession(req, result, 0, quizIndex, quizNamesLength, cb);
                    });
            }
        }
    ], function (err) {
        cb(err);
    });
};

//function callBackOnHighscoresReady(callback, parallelIndex, quizNamesLength) {
//    "use strict";
//    if (parallelIndex === quizNamesLength) {
//        callback();
//    } else {
//        callBackOnHighscoresReady(callback, parallelIndex, quizNamesLength)
//    }
//}

function pushRetrievedHighScoreInToSession(req, highScores, index, quizIndex, quizNamesLength, cb) {
    "use strict";
    //if (quizIndex+1 === quizNamesLength) {
    //    console.log("quizIndex+1: ", quizIndex+1 );
    //    console.log("quizNamesLength: ", quizNamesLength );
    //}
    if (!highScores[index]) {
        req.session.parallelIndex++;
        if (req.session.parallelIndex === quizNamesLength) {
            req.session.parallelIndex = 0;
            cb();
        }
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
            pushRetrievedHighScoreInToSession(req, highScores, index+1, quizIndex, quizNamesLength, cb);
    });
}

function isAnswerIndexTheLastOrInvalid(session) {
    return session.quizLength <= session.answerIndex + 1;
}

function wasTheAnswerCorrect(req) {
    return  answerWereSubmitted(req) &&
            req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data].valid;
}

function answerWereSubmitted(req) {
    return  req.session.questionsAndAnswers[req.session.answerIndex] &&
            req.session.questionsAndAnswers[req.session.answerIndex].answers &&
            req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data];
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
function calculateScoreDivisor(timeStampDiff) {
    return (timeStampDiff / 3600);
}
