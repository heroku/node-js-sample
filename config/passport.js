// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../app/models/user');
var configAuth = require('./auth');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

	// =========================================================================
	// FACEBOOK ================================================================
	// =========================================================================
	passport.use(new FacebookStrategy({
			// pull in our app id and secret from our auth.js file
			clientID        : configAuth.facebookAuth.clientID,
			clientSecret    : configAuth.facebookAuth.clientSecret,
			callbackURL     : configAuth.facebookAuth.callbackURL,
            passReqToCallback : true
    }, function(req, token, refreshToken, profile, done) {
            handleFacebookLogin(req, token, refreshToken, profile, done);
    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    }, function(req, email, password, done) {
        handleLocalSignUp(req, email, password, done)
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        }, function(req, email, password, done) {
            handleLocalLogin(req, email, password, done);
        }));
    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({
            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL
        }, function(req, token, tokenSecret, profile, done) {
            handleTwitterLogin(req, token, tokenSecret, profile, done);
        }));

    function handleFacebookLogin(req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            if (!req.user) {
                User.findOne({'facebook.id': profile.id}, function (err, user) {
                    if (err) return done(err);
                    if (user) return done(null, user); // user found, return that user

                    var newUser = new User();
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = token;
                    newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.facebook.email = profile.emails && profile.emails[0].value.length > 0 ? profile.emails[0].value : profile.displayName;

                    // save our user to the database
                    newUser.save(function (err) {
                        if (err) throw err;
                        return done(null, newUser);
                    });
                });
            } else {
                var user = req.user;
                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails && profile.emails[0].value.length > 0 ? profile.emails[0].value : profile.displayName;

                user.save(function(err) {
                    if (err) throw err;
                    return done(null, user);
                });
            }
        });
    }

    function createNewUser(email, password, profileId, profileToken, name) {
        var newUser = {};
        newUser.email    = email;
        newUser.name    = name;
        newUser.password = password === "" ? password : User.generateHash(password);
        newUser.id = User.generateId();
        newUser.profileId = profileId || "-";
        newUser.profileToken = profileToken || "-";
        newUser.achievements = [];
        newUser.latestAchievement = "Account created";

        // save the user
        User.save(newUser, function(err) {
            if (err) {
                console.log("error: ", err);
                throw err;
            }
        });
        console.log("new user:", JSON.stringify(newUser));
        return newUser;
    }

    function handleLocalSignUp(req, email, password, done) { // TODO: remove comments, do we need it? Sign up vs Sign in question
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUser            = new User();

                    // set the user's local credentials
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });

        });
    }

    function handleLocalLogin(req, email, password, done) {
        //if (req.user) {
        //    return done(null, false, req.flash('loginMessage', 'You are already logged in as: ' + getName(req)));
        //}
        if (!req.user) {
            User.findOne({'local.email': email}, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });
        } else {
            handleLocalSignUp(req, email, password, done);
        }
    }

    function getName(req) {
        req.user.local = req.user.local || {};
        req.user.facebook = req.user.facebook || {};
        req.user.twitter = req.user.twitter || {};
        return req.user.local.email || req.user.facebook.email || req.user.twitter.username;
    }

    function handleTwitterLogin(req, token, tokenSecret, profile, done) {
        if (!req.user) {
            User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                if (err) return done(err);

                if (user) {
                    if (!user.twitter.token) {
                        user.twitter.token       = token;
                        user.twitter.username    = profile.username;
                        user.twitter.displayName = profile.displayName;

                        user.save(function(err) {
                            if (err) throw err;
                            return done(null, user);
                        });
                    }
                    return done(null, user);
                } else {
                    var newUser                 = new User();
                    newUser.twitter.id          = profile.id;
                    newUser.twitter.token       = token;
                    newUser.twitter.username    = profile.username;
                    newUser.twitter.displayName = profile.displayName;
                    newUser.save(function(err) {
                        if (err) throw err;
                        return done(null, newUser);
                    });
                }
            });
        } else {
            var user                 = req.user; // pull the user out of the session

            user.twitter.id          = profile.id;
            user.twitter.token       = token;
            user.twitter.username    = profile.username;
            user.twitter.displayName = profile.displayName;

            user.save(function(err) {
                if (err) throw err;
                return done(null, user);
            });
        }
    }
};
