var mongoose = require('mongoose');

var achievementSchema = mongoose.Schema({
    name: String,
    description: String,
    point: Number,
    group: String,
    type: String,
    subType: String,
    color: String,
    title: String,
    pictureURI: String
});

module.exports = mongoose.model('achievement', achievementSchema);