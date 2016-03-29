// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../app/models/user');
var configAuth = require('./auth');
var stubbed = require('../app/config').isStubbed();

if (stubbed) {
	module.exports = function(passport, asdqwe) {
		console.log(asdqwe);

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
		
		 passport.use('local-login', new LocalStrategy({
				// by default, local strategy uses username and password, we will override with email
				usernameField : 'email',
				passwordField : 'password',
				passReqToCallback : true // allows us to pass back the entire request to the callback
			},
			function(req, email, password, done) { // callback with email and password from our form
				User.findOne({ 'email' :  email }, function(err, user) {
					if (err) return done(err);
					if (!user) return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
					if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

					// all is well, return successful user
					return done(null, user);
				});

			}));
		// =========================================================================
		// LOCAL SIGNUP ============================================================
		// =========================================================================
		// we are using named strategies since we have one for login and one for signup
		// by default, if there was no name, it would just be called 'local'

		passport.use('local-signup', new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField : 'email',
			passwordField : 'password',
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, email, password, done) {

			process.nextTick(function() {
				User.findOne({ 'email' :  email }, function(err, user) {
					if (err)
						return done(err);

					// check to see if theres already a user with that email
					if (user) {
						return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
					} else {
						var newUser = createNewUser(email, password);
						return done(null, newUser);
					}
				});
			});
		}));

		// =========================================================================
		// FACEBOOK ================================================================
		// =========================================================================
		passport.use(new FacebookStrategy({
			// pull in our app id and secret from our auth.js file
			clientID        : configAuth.facebookAuth.clientID,
			clientSecret    : configAuth.facebookAuth.clientSecret,
			callbackURL     : configAuth.facebookAuth.callbackURL
		}, function(token, refreshToken, profile, done) { // facebook will send back the token and profile
			// asynchronous
			process.nextTick(function() {
				// find the user in the database based on their facebook id
				User.findOneBasedOnProfileId(profile.id, function(err, user) {
					if (err)
						return done(err);
					if (user) {
						return done(null, user); // user found, return that user
					} else {
						var name = profile.emails && profile.emails[0].value.length > 0 ? profile.emails[0].value : profile.displayName;
						var newUser = createNewUser(name, "", profile.id, token, name);
						return done(null, newUser);
					}
				});
			});

		}));
	};
} else {
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
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

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

    }));

};
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