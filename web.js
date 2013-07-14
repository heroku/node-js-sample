
var express = require('express');


var app = express.createServer(express.logger());

app.get('/index.html', function(request, response) {
     
      var fs = require('fs');
      var buffer = new Buffer(); 
         
     response.send(buffer.toString('utf-8', fs.readFileSync('index.html')));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
