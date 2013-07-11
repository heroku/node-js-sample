var express = require('express');

var app = express.createServer(express.logger());
var readFile = fs.readFileSync('index.html');
var readFileString = readFile.toString();

app.get('/', function(request, response) {
  response.send(readFileString);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
