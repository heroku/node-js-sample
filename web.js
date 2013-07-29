var express = require('express');
var fs = require('fs')

var app = express.createServer(express.logger());
var line = fs.readFileSync('index.html','utf8',function(err,data){
    if(err) throw err;
    console.log(data);
});

var linebuf = new Buffer(line,'utf8');

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
    response.send(linebuf.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
