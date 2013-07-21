var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());
var buf = fs.readFileSync('index.html');

app.get('/', function(request, response) {
  response.send(buf.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
