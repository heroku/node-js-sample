var async = require("async");

module.exports = function (app, passport, middlewares, sessionHelper) {
    "use strict";
    // root of Deadpool challenges page. Check for authentication
    app.all('/deadpool/*', middlewares.isLoggedIn, middlewares.partOfDeadpool, function (req, res, next) {
        next();
    });

    app.get('/deadpool/challenges', function (req, res) {
        res.render('challenges.ejs');
    });

    app.get('/deadpool/challenges/code/:challengeId', function (req, res) {
        let challengeId = req.params["challengeId"];
        res.send("/deadpool/challenges/code/" + challengeId);
    });

    app.get('/deadpool/challenges/idea/:ideaId', function (req, res) {
        let ideaId = req.params["ideaId"];
        res.send("get for /deadpool/challenges/code/" + ideaId);
    });

    app.post('/deadpool/challenges/idea/:ideaId', function (req, res) {
        let ideaId = req.params["ideaId"];
        res.send("post for /deadpool/challenges/code/" + ideaId);
    });

    app.get('/deadpool/challenges/oneliner/:oneLinerId', function (req, res) {
        let oneLinerId = req.params["oneLinerId"];
        res.send("get for /deadpool/challenges/code/" + oneLinerId);
    });

    app.post('/deadpool/challenges/oneliner/:oneLinerId', function (req, res) {
        let oneLinerId = req.params["oneLinerId"];
        res.send("post for /deadpool/challenges/code/" + oneLinerId);
    });

    app.get('/deadpool/challenges/method/:methodId', function (req, res) {
        let methodId = req.params["methodId"];
        res.send("get for /deadpool/challenges/code/" + methodId);
    });

    app.post('/deadpool/challenges/method/:methodId', function (req, res) {
        let methodId = req.params["methodId"];
        res.send("post for /deadpool/challenges/code/" + methodId);
    });

    app.get('/deadpool/challenges/sprint', function (req, res) {
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

    app.get('/deadpool/challenges/code', function (req, res) {
        res.send("code");
    });

    app.get('/deadpool/challenges/personal', function (req, res) {
        res.send("personal");
    });

    app.get('/deadpool/challenges/history', function (req, res) {
        res.send("history");
    });
};
