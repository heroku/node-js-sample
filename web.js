//Final web.js
var express = require('express');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
    var fs = require('fs');
    var buffer = new Buffer(8);
    buffer = fs.readFileSync('index.html', 'utf-8', function(err, data){
        if(err) throw err;
        console.log(data)});


    response.send(buffer.toString('utf-8',0, buffer.legth));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
