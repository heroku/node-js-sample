var express = require('express');
var data = fs.readFileSync("index.html", "utf8");
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  response.send(data);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
