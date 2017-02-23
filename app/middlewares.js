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
    });
};

exports.partOfDeadpool = function (req, res, next) {
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role !== null && user_role.team === "Deadpool") {
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


exports.setUserRoleDataInSession = function (req, cb) {
    req.session.role = {};
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role !== null) {
                        req.session.role.state = user_role.role;
                        req.session.role.team = user_role.team;
                    } else {
                        req.session.role.state = "guest";
                    }
                    callback();
                });
            } else {
                callback();
            }
        }
    ], function () {
        cb();
    });
};
