var express = require('express')
const bodyparser = require('body-parser');
var app = express()

app.set('port', (process.env.PORT || 5000))

app.use(express.static(__dirname + '/public'))
app.use(bodyparser.json())

const activities = [
  {
    timestamp: "2019-02-09",
    duration: 10,
    type: "run",
  }
];

app.get('/activities', function(request, response){
  return response.status(200).json({activities});
});

app.post('/activities', function(request, response){
  const newActivities = request.body.activities;
  for (const act of newActivities) {
    activities.push(act);
  }
  return response.status(202).send();
})

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
