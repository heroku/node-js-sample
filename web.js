var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
    var indexContent = fs.readFileSync('index.html');
    var buffer = new Buffer(indexContent);
    response.send(buffer.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
