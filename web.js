var http = require('http'),
    fs = require('fs');

var html = fs.readFileSync('./index.html');

http.createServer(function(request, response) {  
    response.writeHeader(200, {"Content-Type": "text/html"});  
    response.write(html);  
    response.end();  
}).listen(5000);
