var mongoose = require('mongoose');

var highscoreSchema = new mongoose.Schema({
    quizName: String,
    userId: String,
    score: { type: Number },
    dateTime: { type: Date, default: Date.now }
});


module.exports = mongoose.model('highscore', highscoreSchema);