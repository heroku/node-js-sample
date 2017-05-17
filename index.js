var express = require('express')
var app = express()

//var module_sample = require('node-module-sample')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!' + module_sample.printSomething("bla ablabal"))
  
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
