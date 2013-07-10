var fs = require('fs');
var express = require('express');
var buffer = fs.readFileSync("index.html");
var request = buffer.toString();
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(request);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
