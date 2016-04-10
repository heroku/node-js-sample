var User = require('./models/user');
var exports = module.exports = {};
var Highscore = require('./models/highscore');
var async = require('async');

exports.validateAnswer = function(req, callback) {
    "use strict";
    let validateAnswerResult = {
        'scoreUp': 0,
        'gameFinished': false,
        'name': req.session.quizName,
        'questionIndex': req.session.answerIndex+1
    };
    let shouldCallback = true;
//    console.log(JSON.stringify(req.session));
    if(!isAnswerIndexValid(req)) {
        validateAnswerResult.gameFinished = true;
    } else if(wasTheAnswerCorrect(req)) {
        validateAnswerResult.scoreUp = req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data].point;
        req.session.score += validateAnswerResult.scoreUp;
        validateAnswerResult.gameFinished = isAnswerIndexTheLast(req.session);
        if (validateAnswerResult.gameFinished) {
            saveHighScore(req, callback);
            shouldCallback = false;
        }
    }
    req.session.validateAnswerResult = validateAnswerResult;
    req.session.answerIndex++;
    if ( shouldCallback ) { callback(); }
};

exports.showHighScoreFor = function(quizName, req) {
    "use strict";
    //var highScore,
    //    responseJson = {};
    //try {
    //    highScore = JSON.parse(fs.readFileSync(HIGH_SCORE_FILE, 'utf8'));
    //    highScore.tables = highScore.tables || {};
    //    highScore.tables.highscore_per_quiz = highScore.tables.highscore_per_quiz || {};
    //    if (quizName === "all") {
    //        responseJson.title = "all";
    //        responseJson.body = highScore.tables.highscore_per_quiz || responseJson;
    //    } else {
    //        responseJson.title = quizName;
    //        responseJson.body = highScore.tables.highscore_per_quiz[quizName] || responseJson;
    //    }
    //} catch (e) {
    //    console.error(e);
    //    console.error("Exception while trying to read highscore table");
    //    responseJson = {'error': true, 'message': 'Server error', 'subMessage': 'Some error happened reading the highscore. Sorry for the inconveniences'};
    //}
    //return responseJson;
    //TODO: show HighScore for quiz
};

function isAnswerIndexValid(req) {
    return req.session.questionsAndAnswers && req.session.questionsAndAnswers[req.session.answerIndex];
}

function isAnswerIndexTheLast(session) {
    return session.quizLength === session.answerIndex+1;
}

function wasTheAnswerCorrect(req) {
    return  req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data] &&
            req.session.questionsAndAnswers[req.session.answerIndex].answers[req.body.data].valid;
}

function noAnswerWereSubmitted(req) {
    return req.body.data.length === 0;
}


function saveHighScore(req, cb) {
    "use strict";
    async.series([
        function (callback) {
            Highscore.findOne({'userId': req.user.id, 'quizName': req.session.quizName}, function (err, result) {
                if (err) return callback(err);
                if (result && result !== null) {
                    updateUserScoreIfBetter(result, req, callback);
                } else {
                    saveNewScore(req, callback);
                    callback();
                }
            });
        }
    ], function (err) {
        cb();
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
}

function isObjectEmpty(o) {
    return Object.getOwnPropertyNames(o).length === 0;
}
