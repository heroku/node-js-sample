var async = require("async");
var Roles = require('./models/role');

exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.redirectURL = req.url;
    res.redirect('/');
};

exports.isLoggedInV2 = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.send({
        error: true,
        message: "Not logged in",
        subMessage: "please log in before using the app"
    });
};

exports.isAdmin = function (req, res, next) {
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role !== null && user_role.role === "admin") {
                        return next();
                    } else {
                        res.redirect('/');
                    }
                    callback();
                });
            } else {
                callback();
            }
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/');
    });
};

exports.partOfTheRequestedTeam = function (req, res, next) {
    "use strict";
    let requestedTeam = req.params["team"];
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role !== null && user_role.team.toLowerCase() === requestedTeam.toLowerCase()) {
                        return next();
                    } else {
                        res.redirect('/');
                    }
                    callback();
                });
            } else {
                callback();
            }
        }
    ], function (err) {
        if (err) return next(err);
    });
};
