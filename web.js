var express = require('express');

var app = express.createServer(express.logger());
var buf = new Buffer(fs.readFileSync('./index.html'),'utf-8');

app.get('/', function(request, response) {
  response.send(buf.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
