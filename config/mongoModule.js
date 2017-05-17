var mongoose = require('mongoose');
var achievementSeeder = require('../app/achievementsSeeder');

// connect to db ===============================================================

(function () {
    "use strict";
    let connection = mongoose.connection,
        connected = false;
    mongoose.connect(process.env.MONGOOSE_MLAB_URI || 'mongodb://sandboxUser:huiokj@ds011880.mlab.com:11880/quizzessandbox');
    connection.once('open', function() {
        console.log("database connection:");
        mongoose.connection.db.dropCollection('achievements', function(err, result) {});
        achievementSeeder.seedAchievement();
        if (process.env.MONGOOSE_MLAB_URI) {
            console.log("sucesfully connected to database");
        } else {
            console.log("sucesfully connected to sandbox database");
        }
    });
    mongoose.connection.on('open', function (ref) {
        connected=true;
        console.log('open connection to mongo server.');
    });

    mongoose.connection.on('connected', function (ref) {
        connected=true;
        console.log('connected to mongo server.');
    });

    mongoose.connection.on('disconnected', function (ref) {
        connected=false;
        console.log('disconnected from mongo server.');
    });

    mongoose.connection.on('close', function (ref) {
        connected=false;
        console.log('close connection to mongo server');
    });

    mongoose.connection.on('error', function (err) {
        connected=false;
        console.log('error connection to mongo server!');
        console.log(err);
    });

    mongoose.connection.db.on('reconnect', function (ref) {
        connected=true;
        console.log('reconnect to mongo server.');
    });
})();
