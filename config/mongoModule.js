var mongoose = require('mongoose');
var Promise = require('mpromise');
var exports = module.exports = {};
var promise = new Promise;
var readDataBasePromise = new Promise;
var secrets = {};

// connect to db ===============================================================
mongoose.connect(process.env.MONGOOSE_MLAB_URI || 'mongodb://sandboxUser:huiokj@ds011880.mlab.com:11880/quizzessandbox');
var connection = mongoose.connection;

connection.once('open', function() {
    console.log("database connection:");
    if (process.env.MONGOOSE_MLAB_URI) {
        console.log("sucesfully connected to database");
    } else {
        console.log("sucesfully connected to sandbox database");
    }
});

// private functions ===========================================================
