var Quiz = require('../app/models/quiz');

exports.seedQuizzes = function (data, callback) {
    saveQuizToDatabase(data, callback);

    function saveQuizToDatabase(data, callback) {
        "use strict";
        try {
            let answers = {},
                questions = [],
                points = {};
            for (key in data) {
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

            var quiz = new Quiz();
            quiz.name = data.name,
                quiz.category = data.category,
                quiz.imageName = data.imageName,
                quiz.gamePlayTimeBased = data.gamePlayTimeBased,
                quiz.pointCalculationTimeBased = data.pointCalculationTimeBased,
                quiz.questionsShouldBeRandomlyOrdered = data.questionsShouldBeRandomlyOrdered,
                quiz.answersShouldBeRandomlyOrdered = data.answersShouldBeRandomlyOrdered,
                quiz.questionsAndAnswers = [];

            for (let question of questions) {
                quiz.questionsAndAnswers.push({
                    question: question,
                    answers: []
                });
            }
            console.log("answers: " + JSON.stringify(answers));
            console.log("points: " + JSON.stringify(points))

            let questionIndex = 0;
            for (let answer_index in answers) {
                console.log("quiz.questionsAndAnswers[" + questionIndex + "]" + quiz.questionsAndAnswers[questionIndex]);
                for (let answer of answers[answer_index]) {
                    console.log("answer" + answer);
                    quiz.questionsAndAnswers[questionIndex].answers.push({
                        valid: points[questionIndex+1][answer_index] > 0,
                        point: points[questionIndex+1][answer_index],
                        answerText: answer
                    });
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