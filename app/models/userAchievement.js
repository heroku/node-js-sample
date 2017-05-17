var mongoose = require('mongoose');

var userAchievementSchema = mongoose.Schema({
    userId : String,
    achievements: []
});

module.exports = mongoose.model('userAchievement', userAchievementSchema);