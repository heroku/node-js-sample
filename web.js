var express = require('express');

var app = express.createServer(express.logger());
var fs=require('fs');
var buf=fs.readFileSync('index.html');
var str=buf.toString();
app.get('/', function(request, response) {
  response.send(str);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
