var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
  var fs = require('fs');
  var mybuffer;
  var k = fs.readFileSync('./index.html','utf8');
  response.send(k.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
