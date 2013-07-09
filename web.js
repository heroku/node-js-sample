var express = require('express');
fs = require('fs');

var app = express.createServer(express.logger());
var content = fs.readFileSync('./index.html', "utf8");

app.get('/', function(request, response) {
console.log (content);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
console.log("Listening on " + port);
});
