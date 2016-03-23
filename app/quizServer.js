var fs = require('fs');
var exports = module.exports = {};
var quizzes = {
    javascript: {
        quizFile: 'json/javascriptQuiz.json',
        answerFile: 'json/javascriptQuizAnswerKeys.json'
    },
    jdk8: {
        quizFile: 'json/jdk8Quiz.json',
        answerFile: 'json/jdk8QuizAnswerKeys.json'
    },
    jdk9: {
        quizFile: 'json/jdk9Quiz.json',
        answerFile: 'json/jdk9QuizAnswerKeys.json'
    },
    freemarker: {
        quizFile: 'json/freemarkerQuiz.json',
        answerFile: 'json/freemarkerQuizAnswerKeys.json'
    }
};

exports.validateAnswer = function(req) {
    if(!isAnswerIndexValid(req)) {
        return {
            'scoreUp': 0,
            'questionIndex': req.session.answerIndex + 1,
            'gameFinished': true
        }
    }

    if(noAnswerWereSubmitted(req)) {
        return {
            'scoreUp': 0,
            'questionIndex': req.session.answerIndex + 1,
            'gameFinished': false
        }
    }

    if(wasTheAnswerCorrect(req)) {
        return {
            'scoreUp': 10,
            'questionIndex': req.session.answerIndex + 1,
            'gameFinished': false
        }
    }

    return {
        'scoreUp': 0,
        'questionIndex': req.session.answerIndex + 1,
        'gameFinished': false
    };
};

exports.loadQuiz = function(selectedQuiz, req) {
    var quiz;
    req.session.answerIndex = 0;

    for ( var key in quizzes ) {
        if (selectedQuiz === key) {
            try {
                quiz = JSON.parse(fs.readFileSync(quizzes[key].quizFile, 'utf8'));
                req.session.quizAnswers = JSON.parse(fs.readFileSync(quizzes[key].answerFile, 'utf8'));
                break;
            } catch(e) {
                console.error(e);
                return {error: true, message: "Server error.", subMessage: "the requested quiz unfortunately not available right now. Please select another one!"};
            }
        }
    }
    if (quiz) { return quiz; }
    return {error: true, message: "Invalid quiz request", subMessage: "the requested quiz unfortunately not exists yet. Come back later!"};
};

function isAnswerIndexValid(req) {
    return req.session.quizAnswers && req.session.quizAnswers[req.session.answerIndex];
}

function wasTheAnswerCorrect(req) {
    return req.session.quizAnswers[req.session.answerIndex] === req.body.data;
}

function noAnswerWereSubmitted(req) {
    return req.body.data.length === 0;
}
