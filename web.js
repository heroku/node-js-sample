var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');

app.get('/', function(request, response) {
    var k = fs.readFileSync('index.html', function(err, data){
	if(err) throw err;
	console.log(data)});
    response.send(k);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
