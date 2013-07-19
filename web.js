var express = require('express')
  , fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var data = fs.readFileSync('./index.html').toString('utf8');
  response.send(data);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
