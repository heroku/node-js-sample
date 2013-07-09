var express = require('express');
var app = express.createServer(express.logger());
var fs = require('fs');
var buffer = new Buffer(8);

app.get('/', function(request, response) {
    fs.readFileSync('index.html', function(err,data){
    if(err) throw err;
    console.log(data)});
    Response.send('Hello World 2!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
