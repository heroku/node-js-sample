module.exports = function (app, passport, middlewares) {
    "use strict";
    // root of Deadpool challenges page. Check for authentication
    app.get('/deadpool/*', middlewares.isLoggedIn, function (req, res, next) {
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

    app.get('/deadpool/history', function (req, res) {
        res.send("/deadpool/history");
    });
};
