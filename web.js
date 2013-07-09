var express = require('express');
fs = require('fs');

var app = express.createServer(express.logger());
var content = fs.readFileSync('./index.html');

app.get('/', function(request, response) {
// download file with content
// response.send( content );
// display content
console.log (content);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
console.log("Listening on " + port);
});
