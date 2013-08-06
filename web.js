var num = 0;
var express = require('express');
var app = express();
app.use(express.logger());

var fs = require('fs');
var readFile = fs.readFileSync('index.html');
var readFileString = readFile.toString();

app.get('/', function(request, response) {
  readFile = fs.readFileSync('index.html');
  response.send(readFile.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
