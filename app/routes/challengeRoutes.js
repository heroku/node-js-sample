var async = require("async");

module.exports = function (app, passport, middlewares, sessionHelper) {
    "use strict";
    // root of Deadpool challenges page. Check for authentication
    app.all('/challenges/:team/*', middlewares.isLoggedIn, middlewares.partOfTheRequestedTeam, function (req, res, next) {
        next();
    });

    app.get('/challenges/:team/home', function (req, res) {
        let team = req.params["team"];
        res.render('challenges.ejs', {
            team: team
        });
    });

    app.get('/challenges/:team/code/:challengeId', function (req, res) {
        let challengeId = req.params["challengeId"];
        let team = req.params["team"];
        res.send("/challenges/" +  + "/code/" + challengeId);
    });

    app.get('/challenges/:team/idea/:ideaId', function (req, res) {
        let ideaId = req.params["ideaId"];
        let team = req.params["team"];
        res.send("get for /challenges/" + team + "/code/" + ideaId);
    });

    app.post('/challenges/:team/idea/:ideaId', function (req, res) {
        let ideaId = req.params["ideaId"];
        let team = req.params["team"];
        res.send("post for /challenges/" + team + "/code/" + ideaId);
    });

    app.get('/challenges/:team/oneliner/:oneLinerId', function (req, res) {
        let oneLinerId = req.params["oneLinerId"];
        let team = req.params["team"];
        res.send("get for /challenges/" + team + "/code/" + oneLinerId);
    });

    app.post('/challenges/:team/oneliner/:oneLinerId', function (req, res) {
        let oneLinerId = req.params["oneLinerId"];
        let team = req.params["team"];
        res.send("post for /challenges/" + team + "/code/" + oneLinerId);
    });

    app.get('/challenges/:team/method/:methodId', function (req, res) {
        let methodId = req.params["methodId"];
        let team = req.params["team"];
        res.send("get for /challenges/" + team + "/code/" + methodId);
    });

    app.post('/challenges/:team/method/:methodId', function (req, res) {
        let methodId = req.params["methodId"];
        let team = req.params["team"];
        res.send("post for /challenges/" + team + "/code/" + methodId);
    });

    app.get('/challenges/:team/sprint', function (req, res) {
        async.series([
            function (callback) {
                sessionHelper.setUserRoleDataInSession(req, callback);
            }
        ], function (err) {
            if (err) return next(err);
            res.render('sprint.ejs', {
                user: sessionHelper.buildUser(req)
            });
        });

    });

    app.get('/challenges/:team/code', function (req, res) {
        res.send("code");
    });

    app.get('/challenges/:team/personal', function (req, res) {
        let team = req.params["team"];
        res.render("personal.ejs", {
            user: sessionHelper.buildUser(req),
            team: team
        });
    });

    app.get('/challenges/:team/history', function (req, res) {
        res.send("history");
    });
};
