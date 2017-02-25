var Quiz = require('../app/models/quiz');

exports.seedQuizzes = function (req, callback) {
    "use strict";
    let data = req.body,
        user = req.user;
    saveQuizToDatabase(data, user, callback);

    function saveQuizToDatabase(data, user, callback) {
        try {
            let answers = {},
                questions = [],
                points = {};
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    if (key.startsWith("answer_")) {
                        let answer_index = /(.*)_(\d*)/.exec(key)[2];
                        answers[answer_index] = answers[answer_index] || [];
                        answers[answer_index].push(data[key]);
                    }
                    if (key.startsWith("question_")) {
                        questions.push(data[key]);
                    }
                    if (key.startsWith("points_")) {
                        let points_index = /(.*)_(\d*)/.exec(key)[2];
                        points[points_index] = points[points_index] || [];
                        points[points_index].push(data[key]);
                    }
                }
            }

            let quiz = new Quiz();
            quiz.creator = user.id;
            quiz.name = data.name;
            quiz.category = data.category;
            quiz.imageName = data.imageName;
            quiz.gamePlayTimeBased = data.gamePlayTimeBased;
            quiz.pointCalculationTimeBased = data.pointCalculationTimeBased;
            quiz.questionsShouldBeRandomlyOrdered = data.questionsShouldBeRandomlyOrdered;
            quiz.answersShouldBeRandomlyOrdered = data.answersShouldBeRandomlyOrdered;
            quiz.questionsAndAnswers = [];

            for (let question of questions) {
                quiz.questionsAndAnswers.push({
                    question: question,
                    answers: []
                });
            }
            console.log("answers: " + JSON.stringify(answers));
            console.log("points: " + JSON.stringify(points));

            let questionIndex = 0;
            for (let answer_index in answers) {
                console.log("quiz.questionsAndAnswers[" + questionIndex + "]" + quiz.questionsAndAnswers[questionIndex]);
                let pointIndex = 0;
                for (let answer of answers[answer_index]) {
                    console.log("answer" + answer);
                    quiz.questionsAndAnswers[questionIndex].answers.push({
                        valid: points[questionIndex + 1][pointIndex] > 0,
                        point: points[questionIndex + 1][pointIndex] || 0,
                        answerText: answer
                    });
                    pointIndex++;
                }
                console.log("quiz.questionsAndAnswers[" + questionIndex + "]" + quiz.questionsAndAnswers[questionIndex]);
                questionIndex++;
            }

            quiz.save(function (err) {
                if (err) throw err;
            });
            console.log("Quiz sucessfully seeded to database");
            if (callback) {
                callback();
            }
        } catch (e) {
            if (callback) {
                callback(e);
            }
        }
    }
};

exports.updateQuiz = function (quiz, quizFromRequest, user) {
    "use strict";
    try {
        let answers = {},
            questions = [],
            points = {};
        for (let key in quizFromRequest) {
            if (quizFromRequest.hasOwnProperty(key)) {
                if (key.startsWith("answer_")) {
                    let answer_index = /(.*)_(\d*)/.exec(key)[2];
                    answers[answer_index] = answers[answer_index] || [];
                    answers[answer_index].push(quizFromRequest[key]);
                }
                if (key.startsWith("question_")) {
                    questions.push(quizFromRequest[key]);
                }
                if (key.startsWith("points_")) {
                    let points_index = /(.*)_(\d*)/.exec(key)[2];
                    points[points_index] = points[points_index] || [];
                    points[points_index].push(quizFromRequest[key]);
                }
            }
        }

        quiz.creator = user.id;
        quiz.name = quizFromRequest.name;
        quiz.category = quizFromRequest.category;
        quiz.imageName = quizFromRequest.imageName;
        quiz.gamePlayTimeBased = quizFromRequest.gamePlayTimeBased;
        quiz.pointCalculationTimeBased = quizFromRequest.pointCalculationTimeBased;
        quiz.questionsShouldBeRandomlyOrdered = quizFromRequest.questionsShouldBeRandomlyOrdered;
        quiz.answersShouldBeRandomlyOrdered = quizFromRequest.answersShouldBeRandomlyOrdered;
        quiz.questionsAndAnswers = [];

        for (let question of questions) {
            quiz.questionsAndAnswers.push({
                question: question,
                answers: []
            });
        }
        console.log("answers: " + JSON.stringify(answers));
        console.log("points: " + JSON.stringify(points));

        let questionIndex = 0;
        for (let answer_index in answers) {
            console.log("quiz.questionsAndAnswers[" + questionIndex + "]" + quiz.questionsAndAnswers[questionIndex]);
            let pointIndex = 0;
            for (let answer of answers[answer_index]) {
                console.log("answer" + answer);
                quiz.questionsAndAnswers[questionIndex].answers.push({
                    valid: points[questionIndex + 1][pointIndex] > 0,
                    point: points[questionIndex + 1][pointIndex] || 0,
                    answerText: answer
                });
                pointIndex++;
            }
            console.log("quiz.questionsAndAnswers[" + questionIndex + "]" + quiz.questionsAndAnswers[questionIndex]);
            questionIndex++;
        }

        quiz.save(function (err) {
            if (err) throw err;
        });
        console.log("Quiz sucessfully updated to database");
    } catch (e) {
        console.error("update quiz not worked");
        console.error(e);
    }
};