var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var users = JSON.parse(fs.readFileSync('./json/user.json', 'utf8'));
var exports = module.exports = {};

var userSchema = mongoose.Schema({
	displayName: String,
	shouldUseFastAnswers: { type: Boolean, default: false },
	local            : {
		name        : String,
		password     : String
	},
	facebook         : {
		id           : String,
		token        : String,
		name         : String
	},
	twitter          : {
		id           : String,
		token        : String,
		displayName  : String,
		username     : String,
        profilePhoto : String
	},
	google           : {
		id           : String,
		token        : String,
		email        : String,
		name         : String
	}
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);


function validatePassword(password, encryptedPassword) {
    return bcrypt.compareSync(password, encryptedPassword);
}