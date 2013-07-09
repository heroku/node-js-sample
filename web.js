var express = require('express');
var fs = require('fs');
var index = fs.readFileSync('index.html');
var buffer = new Buffer();
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
	buffer.write(index,"utf-8");
	response.send(buffer);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
