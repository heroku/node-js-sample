var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
var fs = require('fs');
fs.readFile('index.html', funtion (err, content) {
if (err) {
res.writeHead(300, {'Content-Type':'text/plain'});
res.end('internal error: ' + err);
} else {
res.writeHead(200, {'Content-Type':'text/html'});
res.end(content, 'utf-8');
}
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
