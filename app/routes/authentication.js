var async = require("async");
var UserAchievement = require('./../models/userAchievement');
var REDIRECT_TO_PROFILE = '/profile';

module.exports = function (app, passport, middlewares, sessionHelper) {
    "use strict";

    app.post('/login', function (req, res) {
            passport.authenticate('local-login', {
                successRedirect: getRedirectURL(req),
                failureRedirect: '/',
                failureFlash: true
            })(req, res);
        }
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', middlewares.isLoggedIn, function (req, res) {
        let user_achievements = [];
        async.series([
            function (callback) {
                UserAchievement.findOne({'userId': req.user.id}, function (err, achievements) {
                    if (err) return callback(err);
                    if (achievements !== null) {
                        user_achievements = achievements.achievements;
                    }
                    callback();
                });
            },
            function (callback) {
                sessionHelper.setUserRoleDataInSession(req, callback);
            }
        ], function (err) {
            if (err) return next(err);
            console.log(" req.session.roleState: ", req.session.roleState);
            res.render('profile.ejs', {
                user: req.user,
                admin: req.session.roleState,
                achievements: user_achievements
            });
        });
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', function (req, res) {
            passport.authenticate('twitter', {
                successRedirect: getRedirectURL(req),
                failureRedirect: '/'
            })(req, res);
        }
    );

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    app.get('/auth/facebook/callback', function (req, res) {
            passport.authenticate('facebook', {
                successRedirect: getRedirectURL(req),
                failureRedirect: '/'
            })(req, res);
        }
    );

    app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));
    app.get('/connect/facebook/callback', function (req, res) {
            passport.authorize('facebook', {
                successRedirect: getRedirectURL(req),
                failureRedirect: '/'
            })(req, res);
        }
    );

    app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));
    app.get('/connect/twitter/callback', function (req, res) {
            passport.authorize('twitter', {
                successRedirect: getRedirectURL(req),
                failureRedirect: '/'
            })(req, res);
        }
    );

    app.get('/unlink/local', function (req, res) {
        let user = req.user;
        user.local.name = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect(REDIRECT_TO_PROFILE);
        });
    });

    app.get('/unlink/facebook', function (req, res) {
        let user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect(REDIRECT_TO_PROFILE);
        });
    });

    app.get('/unlink/twitter', function (req, res) {
        let user = req.user;
        user.twitter.token = undefined;
        user.twitter.profilePhoto = undefined;
        user.save(function (err) {
            res.redirect(REDIRECT_TO_PROFILE);
        });
    });
};

// private methods ======================================================================
function getRedirectURL(req) {
    "use strict";
    let url = req.session.redirectURL || REDIRECT_TO_PROFILE;
    req.session.redirectURL = null;
    return url;
}
