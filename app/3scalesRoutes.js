module.exports = function (app) {
    "use strict";
    /*
     * 3scalesRoutes
     */
    app.get('/3scaletest', function (req, res) {
        res.send(req.query['user_key']);
    });
};
