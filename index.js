var express = require('express')
const bodyparser = require('body-parser');
var app = express()

app.set('port', (process.env.PORT || 3000))

app.use(express.static(__dirname + '/public'))
app.use(bodyparser.json())


/*
 {
 "activities-heart": [{
 "dateTime": "2018-03-25",
 "value": {
 "customHeartRateZones": [],
 "heartRateZones": [{
 "caloriesOut": 667.27228,
 "max": 87,
 "min": 30,
 "minutes": 540,
 "name": "Out of Range"
 }, {
 "caloriesOut": 1706.79212,
 "max": 122,
 "min": 87,
 "minutes": 823,
 "name": "Fat Burn"
 }, {
 "caloriesOut": 112.48714,
 "max": 148,
 "min": 122,
 "minutes": 15,
 "name": "Cardio"
 }, {
 "caloriesOut": 12.43216,
 "max": 220,
 "min": 148,
 "minutes": 1,
 "name": "Peak"
 }],
 "restingHeartRate": 83
 }
 }, {
 "dateTime": "2018-03-31",
 "value": {
 "customHeartRateZones": [],
 "heartRateZones": [{
 "caloriesOut": 575.94372,
 "max": 87,
 "min": 30,
 "minutes": 465,
 "name": "Out of Range"
 }, {
 "caloriesOut": 931.33614,
 "max": 122,
 "min": 87,
 "minutes": 490,
 "name": "Fat Burn"
 }, {
 "caloriesOut": 105.67336,
 "max": 148,
 "min": 122,
 "minutes": 13,
 "name": "Cardio"
 }, {
 "caloriesOut": 0,
 "max": 220,
 "min": 148,
 "minutes": 0,
 "name": "Peak"
 }],
 "restingHeartRate": 84
 }
 }]
}   */
 const activities = [
 {
    "startTime": "2019-02-09:13:10",
    "calories": "300",
  }
];

app.get('/activities', function(request, response){
  console.log(activities);
  return response.status(200).json({activities});
});


app.post('/activities', function(request, response){
  const newActivities = request.body;

  
  //console.log(request);
  for (const act of newActivities) {
    activities.push(act);
  }
  console.log(newActivities)
  return response.status(202).send(); 
})

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(3000, function(){
	console.log('running on port 3000')
});