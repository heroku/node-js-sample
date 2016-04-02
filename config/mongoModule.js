var mongoose = require('mongoose');
var achievementSeeder = require('../app/achievementsSeeder');
var quizSeeder = require('../app/quizSeeder');

// connect to db ===============================================================
mongoose.connect(process.env.MONGOOSE_MLAB_URI || 'mongodb://sandboxUser:huiokj@ds011880.mlab.com:11880/quizzessandbox');
var connection = mongoose.connection;

connection.once('open', function() {
    console.log("database connection:");
    mongoose.connection.db.dropCollection('achievements', function(err, result) {});
    achievementSeeder.seedAchievement();
//    quizSeeder.seedQuizzes(); // it was only for testing the schema for first. Maybe it will be used to save a new quiz
    if (process.env.MONGOOSE_MLAB_URI) {
        console.log("sucesfully connected to database");
    } else {
        console.log("sucesfully connected to sandbox database");
    }
});

// private functions ===========================================================
