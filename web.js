var express = require('express');
var app = express.createServer(express.logger());
var fs = require('fs');
var buffer = new Buffer(8);

app.get('/', function(request, response) {
   Response.send('Hello World 2!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
