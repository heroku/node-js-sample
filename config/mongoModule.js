var mongoose = require('mongoose');
var Promise = require('mpromise');
var exports = module.exports = {};
var promise = new Promise;
var readDataBasePromise = new Promise;
var secrets = {};

// connect to db ===============================================================
mongoose.connect('mongodb://nodejsadmin:asdasd@ds013589.mlab.com:13589/quizzes-nodejs');
var connection = mongoose.connection;

connection.once('open', function() {
    console.log("sucesfully connected to database");
    //setSecrets(getAppSecrets());
    //promise.fulfill();
});

// private functions ===========================================================
//function getAppSecrets() {
//    console.log("get app secrets");
//    readDataBasePromise.onResolve(function (err) {
//        if (err) { console.error(err); }
//
//        mongoose.model('appsecrets').find({}).exec(function(error, secretsFromDB) {
//            if (err) { console.error(err); }
//            readDataBasePromise.fulfill();
//            return secretsFromDB;
//        });
//    });
//}

//function setSecrets(err, secretsFromDB) {
//    if (err) { console.error(err); }
//    if (secrets && secrets.length > 0) {
//        console.log("secrets exist");
//        secrets = secretsFromDB;
//    } else {
//        console.error("err, secrets does not exists. Dieeeeeee");
//        process.exit(1);
//    }
//}

// public API  =================================================================
exports.getSecrets = function() {
    promise.onResolve(function (err) {
        if (err) { console.error(err); }
        return secrets;
    });
};