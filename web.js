var express = require('express');

var app = express.createServer(express.logger());
var buf = fs.readFileSync('index.html');
var finalString = buf.toString('utf-8',0,buf.length-1);

app.get('/', function(request, response) {
  response.send(finalString);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
