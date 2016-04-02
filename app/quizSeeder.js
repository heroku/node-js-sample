var Quiz = require('../app/models/quiz');

exports.seedQuizzes = function () {
    saveQuizToDatabase();

    function saveQuizToDatabase(achi) {
        var quiz = new Quiz();
        quiz.name = "js",
        quiz.category = "frontend",
        quiz.imageName = "javascript.jpg",
        quiz.gamePlayTimeBased = true,
        quiz.pointCalculationTimeBased = true,
        quiz.questionsShouldBeRandomlyOrdered = true,
        quiz.answersShouldBeRandomlyOrdered = true,
        quiz.questionsAndAnswers = [{
            question: "first question",
            answers:  [{
                valid: true,
                point: 1,
                answerText: "first answer"
            },{
                valid: false,
                point: 0,
                answerText: "second answer"
            }]
        }];

        quiz.save(function (err) {
            if (err) throw err;
        });
        console.log("Quiz sucessfully seeded to database");
    }
};