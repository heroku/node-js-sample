
var express = require('express');
var fs = require('fs');
var my_index = new Buffer(fs.readFileSync('index.html', 'utf-8');

var app = express.createServer(express.logger());

app.get('/index.html', function(request, response) {
     
         
     response.send(my_index.toString);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
