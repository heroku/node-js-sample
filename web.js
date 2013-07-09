var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
var fs = require('fs');
    fs.readFileSync('index.html', 'utf-8', function(err, data){
	if(err) throw err;
	console.log(data);
    response.send(data)});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
