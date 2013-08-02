var http = require('http');
http.createServer(function(request, response) {
response.writeHead(200);
response.Write("somecode");
setTimeout(function(){
response.write("dog poo");
response.end(); }
, 5000);
