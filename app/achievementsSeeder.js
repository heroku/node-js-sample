var Achievement = require('../app/models/achievement');
var fs = require('fs');

exports.seedAchievement = function () {
    var ACHIEVEMENTS_FILE = 'json/achievements.json';
    var achievements = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf8'));

    for (key in achievements) {
        var achi = achievements[key];
        achi.name = key;
        saveAchievementToDatabase(achi);
    }
    console.log("achievements sucessfully seeded to database");

    function saveAchievementToDatabase(achi) {
        var achievement = new Achievement();
        achievement.name = achi.name;
        achievement.description = achi.description;
        achievement.point = achi.point;
        achievement.group = achi.group;
        achievement.type = achi.type;
        achievement.subType = achi.subType;
        achievement.color = achi.color;
        achievement.title = achi.title;
        achievement.pictureURI = achi.pictureURI;

        achievement.save(function (err) {
            if (err) throw err;
        });
    }
};