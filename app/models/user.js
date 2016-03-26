// app/models/user.js
//var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var users = JSON.parse(fs.readFileSync('./json/user.json', 'utf8'));
var exports = module.exports = {};

exports.findOne = function (user, callback) {
    var email = user.email;
    for (var i = 0; i < users.length; i++) {
        var act_user = users[i];
        act_user.validPassword = function (password) {
            if (act_user["password"].length > 0) {
                return validatePassword(password, act_user["password"]);
            }
            return false;
        };

        if (act_user["email"] === user.email) {
            callback(null, act_user);
            return;
        }
    }
    callback(null, null);
};

exports.findOneBasedOnProfileId = function (profileId, callback) {
    for (var i = 0; i < users.length; i++) {
        var act_user = users[i];
        if (act_user["profileId"] === profileId) {
            callback(null, act_user);
            return;
        }
    }
    callback(null, null);
};

exports.findById = function (id, callback) {
    for (var i = 0; i < users.length; i++) {
        if (users[i]["id"] === id) {
            callback(null, users[i]);
            return;
        }
    }
    callback(null, null);
};

//// generating a hash
exports.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//// checking if password is valid

function validatePassword(password, encryptedPassword) {
    return bcrypt.compareSync(password, encryptedPassword);
}

exports.userSchema = {
    'local': {
        'email': '',
        'password': ''
    },
    'facebook': {
        'id': '',
        'token': '',
        'email': '',
        'name': ''
    },
    'twitter': {
        'id': '',
        'token': '',
        'displayName': '',
        'username': ''
    },
    'google': {
        'id': '',
        'token': '',
        'email': '',
        'name': ''
    }
};

exports.generateId = function () {
    var id = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    for (var i = 0; i < users.length; i++) {
        if (users[i]["id"] === id) {
            return this.generateId();
        }
    }
    return id;
};

exports.save = function (newUser, callback) {
    users.push(newUser);
    try {
        fs.writeFileSync('./json/user.json', JSON.stringify(users));
        console.log('User saved');
        callback();
    } catch (e) {
        console.log(e);
        return;
    }
};

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
