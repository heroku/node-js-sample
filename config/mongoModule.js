var mongoose = require('mongoose');
var achievementSeeder = require('../app/achievementsSeeder');

// connect to db ===============================================================
mongoose.connect(process.env.MONGOOSE_MLAB_URI || 'mongodb://sandboxUser:huiokj@ds011880.mlab.com:11880/quizzessandbox');
var connection = mongoose.connection;

connection.once('open', function() {
    console.log("database connection:");
    achievementSeeder.seedAchievement();
    if (process.env.MONGOOSE_MLAB_URI) {
        console.log("sucesfully connected to database");
    } else {
        console.log("sucesfully connected to sandbox database");
    }
});

// private functions ===========================================================
