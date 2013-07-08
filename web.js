var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
var fs = require("fs"), sys=require("sys");
var content = fs.readFileSync("./index.html","utf8");
sys.put(JSON.parse(content));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
