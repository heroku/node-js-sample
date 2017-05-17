var async = require("async");
var User = require('./../models/user');

var REDIRECT_TO_QUIZZES = '/quizzes';

module.exports = function (app, middlewares) {
    "use strict";
    /*
     * Home page
     */
    app.get('/', function (req, res) {
        if (req.user) {
            res.redirect(REDIRECT_TO_QUIZZES);
        } else {
            res.render('index.ejs', {
                message: req.flash('loginMessage'),
                shouldShowThirdPartyLogins: (!req.user || (req.user && (!req.user.facebook.token || !req.user.twitter.token))),
                shouldShowFacebookLogin: (!req.user || (req.user && !req.user.facebook.token)),
                shouldShowTwitterLogin: (!req.user || (req.user && !req.user.twitter.token))
            });
        }
    });

    /*
     * FAQ
     */
    app.get('/faq', function (req, res) {
        res.render('faq.ejs', {
            loggedIn: req.isAuthenticated()
        });
    });

    app.post('/update-display-name', middlewares.isLoggedInV2, function (req, res) {
        let updatedUser = req.user;
        let newDisplayName = req.body.data.trim();
        if (!newDisplayName || newDisplayName === "") {
            res.send({
                error: true,
                message: "New display Name was not given",
                subMessage: "Please provide a new name"
            });
            return;
        }
        async.series([
            function (callback) {
                User.findOne({'displayName': newDisplayName}, function (err, user) {
                    if (err) return callback(err);
                    if (user === null) {
                        updatedUser.displayName = newDisplayName;
                    } else {
                        res.send({
                            error: true,
                            message: "Unable to update the display name",
                            subMessage: "That display name is already taken"
                        });
                        return;
                    }
                    callback();
                });
            }
        ], function (err) {
            if (err) return next(err);
            updatedUser.save(function (err) {
                if (err) res.send({
                    error: true,
                    message: "unable to save the user to db",
                    subMessage: "reason: " + err
                });
                res.send({error: false});
            });
        });
    });

    app.post('/update-user-fast-answers', middlewares.isLoggedInV2, function (req, res) {
        let updatedUser = req.user;
        let shouldUseFastAnswers = req.body.data === "true";
        async.series([
            function (callback) {
                User.findById(req.user.id, function (err, user) {
                    if (err) return callback(err);
                    if (user === null) {
                        res.send({
                            error: true,
                            message: "Unable to update the display name",
                            subMessage: "That display name is already taken"
                        });
                        return;
                    } else {
                        updatedUser.shouldUseFastAnswers = shouldUseFastAnswers;
                    }
                    callback();
                });
            }
        ], function (err) {
            if (err) return next(err);
            updatedUser.save(function (err) {
                if (err) res.send({
                    error: true,
                    message: "unable to save the user to db",
                    subMessage: "reason: " + err
                });
                res.send({error: false});
            });
        });
    });
};
