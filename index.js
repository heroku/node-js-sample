var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

function waitForever() {
  console.log("this will never happen")
}

app.get('/', function(request, response) {
  setTimeout(waitForever, 31000)
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
