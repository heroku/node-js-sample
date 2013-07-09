//Final web.js
var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
<<<<<<< HEAD
    var fs = require('fs');
    var buffer = new Buffer(8);
    buffer = fs.readFileSync('index.html', 'utf-8', function(err, data){
        if(err) throw err;
        console.log(data)});
    

    response.send(buffer.toString('utf-8',0, buffer.legth));
=======
  response.send('Hello World!');
>>>>>>> e652b2b7ce7289880eb9dad067468f56ba15a0b7
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

