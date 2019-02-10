var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/activities', function(request, response){
  const activities = [
    {
      timestamp: "2019-02-09",
      duration: 10,
      type: "run",
    }
  ];
  return response.status(200).json({activities});
});

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
