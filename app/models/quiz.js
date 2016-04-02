var mongoose = require('mongoose');

var AnswersSchema = new mongoose.Schema({
    valid: Boolean,
    point: { type: Number },
    answerText: String
});

var QuestionsAndAnswersSchema = new mongoose.Schema({
    question: String,
    answers:  [AnswersSchema]
});

var quizSchema = mongoose.Schema({
    name: String,
    category: String,
    imageName: String,
    gamePlayTimeBased: Boolean,
    pointCalculationTimeBased: Boolean,
    questionsShouldBeRandomlyOrdered: Boolean,
    answersShouldBeRandomlyOrdered: Boolean,
    questionsAndAnswers: [QuestionsAndAnswersSchema]
});

module.exports = mongoose.model('quiz', quizSchema);