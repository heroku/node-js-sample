module.exports = function (app, passport) {
    "use strict";
    app.get('/webhook', function (req, res) {
        res.send(req.query['hub.challenge']);
    });

};