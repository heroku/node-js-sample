var async = require("async");
var Roles = require('./models/role');

exports.setUserRoleDataInSession = function (req, cb) {
    "use strict";
    async.series([
        function (callback) {
            if (req.user) {
                Roles.findOne({'userId': req.user.id}, function (err, user_role) {
                    if (err) return callback(err);
                    if (user_role !== null) {
                        req.session.roleState = user_role.role;
                        req.session.roleTeam = user_role.team;
                    } else {
                        req.session.roleState = "guest";
                    }
                    callback();
                });
            } else {
                callback();
            }
        }
    ], function () {
        cb();
    });
};

exports.buildUser = function (req) {
    "use strict";
    let user = req.user;
    user.role = req.session.roleState || "";
    user.team = req.session.roleTeam || "";
    return user;
};
