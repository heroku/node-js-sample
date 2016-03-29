var mongoose = require('mongoose');

var appSecretsSchema = mongoose.Schema({
    facebookAuth : {
        clientID      : String,
        clientSecret  : String,
        callbackURL   : String
    }
});

module.exports = mongoose.model('appsecrets', appSecretsSchema);