var express = require('express');

var fs = require('fs');

var buffer = new buffer();

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(buffer.toString('utc 8', fs.readFileSync('index.html')));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
