var express = require('express');
var fs = require('fs');
var index = fs.readFileSync('index.html');
var buffer = new Buffer(index,"utf-8");
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
//		response.writeHeader(200, {"Content-Type": "text/html"});
		response.send(buffer.toString('utf-8'));
//		response.end();
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
