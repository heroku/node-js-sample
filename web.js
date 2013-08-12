var express = require('express');
var app = express();
app.use(express.logger());

var fs = require('fs');

app.get('/', function(request, response) {

  data = fs.readFileSync('index.html');
  strdata = data.toString('utf8');
 // response.send('Hello World! from krishna prasad');
  response.send(strdata);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});

