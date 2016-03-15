var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/pub'))

app.get('/', function(request, response) {
  response.send('Hello World!')
  console.log("request: " + request);
})

app.get('/frontend', function(request, response) {
  response.send('FrontEnd!');
  console.log("Frontend initialized");
  console.log("request: " + request);
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
