


var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 8080))
app.use(express.static(__dirname + '/public'))


var fs = require('fs')
var buffer = new Buffer(25600) 

var website = fs.readFileSync('index.html', 'utf8') 

app.get('/', function(request, response) {
  response.send(website)
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
