
var express = require('express');
var fs = require('fs');


var app = express.createServer(express.logger());

app.get('/', function(request, response) {
     
     var my_index = new Buffer (fs.readFileSync('index.html'), 'utf-8');
    
     response.send(my_index.toString(utf-8));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
