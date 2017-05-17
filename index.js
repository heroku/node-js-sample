var express = require('express')
var app = express()
var Discord = require("discord.js");
var ver ="0.86"
var mybot = new Discord.Client();
var getJSON = require('get-JSON');

mybot.on("ready", function () {
	console.log("Ready to begin! Serving in " + mybot.channels.length + " channels");
});

mybot.on("message", function(message) {
    if (message.content === "!live") {
        getJSON("https://api.twitch.tv/kraken/streams/lalicel", function(err, res) {
            if (res.stream == null) {
                mybot.reply(message, "she is currently not live");
            } else {
                mybot.reply(message, "she is currently live");
				mybot.sendMessage(message, "https://www.twitch.tv/lalicel");
            }
        });
    }
});
//long comands 
mybot.on("message", function(message){

            if( message.content === "!my_avatar" ){

        var usersAvatar = message.sender.avatarURL;

        if(usersAvatar){
            // user has an avatar

            mybot.reply(message, "your avatar can be found at " + usersAvatar);

        }else{
            // user doesn't have an avatar

            mybot.reply(message, "you don't have an avatar!");
        }

            }

} );



//bot stuff 
mybot.on("message", function(message) {
    if(message.content === "!help") {
        mybot.reply(message, "**My current Commands** ```!about_bot, !live, !my_avatar, !twitch, !youtube, hype, cry```" );
    }

});

mybot.on("message", function(message) {
    if(message.content === "!about_bot") {
        mybot.reply(message, "I was made by SloppierKitty7. I was written in nodejs and i'm runing on heroku and soon will be on github. I'm current on version is: " + ver + " @SloppierKitty7 should really update me");
		mybot.sendFile(message, "http://i.imgur.com/izUfF1f.png");

    }
});

//links

mybot.on("message", function(message) {
    if(message.content === "!twitch") {
        mybot.reply(message, "https://www.twitch.tv/lalicel");
    }
});

mybot.on("message", function(message) {
    if(message.content === "!youtube") {
        mybot.reply(message, "https://www.youtube.com/channel/UCVsd_WSEaW5oJTRZTI-2yBQ");
    }
});

//emots

mybot.on("message", function(message) {
    if(message.content === "hype") {
        mybot.sendFile(message, "http://i.imgur.com/zDPIzq4.png");
    }
});
mybot.on("message", function(message) {
    if(message.content === "cry") {
        mybot.sendFile(message, "http://i.imgur.com/izUfF1f.png");
    }
});








app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
