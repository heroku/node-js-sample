var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))


var fs = require('fs')
var buffer = new Buffer(25600) 





//buffer.write(fs.readFileSync('index.html'))

buffer.write('ausprobiert!')
website = buffer.toString('ascii')

app.get('/', function(request, response) {
  response.send(website)
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
