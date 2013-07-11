var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
  var fs = require('fs');
  var index_buffer = fs.readFile('/index.html', function (err, data) {
    if (err) throw err;
    console.log(data);
  });
  var index_string = index_buffer.toString();
  response.send(index_string);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
