module.exports = function (app, middlewares) {
    "use strict";

    app.use(function (req, res, next) {
        let now = new Date((new Date() - 1000 * 60 * 60)).toISOString();
        console.log(now.slice(0, 10) + " " + now.slice(11, 16));
        next();
    });


    app.get('/isSandbox', function (req, res) {
        res.send("isSandbox: " + (app.get("appSecret") === "itsNotASecretAnyMore"));
    });

    app.get('/isAdmin', middlewares.isAdmin, function (req, res) {
        res.send("isAdmin: true (if false, you would have been redirected to homepage)");
    });
};
