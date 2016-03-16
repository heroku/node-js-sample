var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var javascriptQuiz = JSON.parse(fs.readFileSync('json/javascriptQuiz.json', 'utf8'));
var jdk8Quiz = JSON.parse(fs.readFileSync('json/jdk8Quiz.json', 'utf8'));
var jdk9Quiz = JSON.parse(fs.readFileSync('json/jdk9Quiz.json', 'utf8'));
var freemarkerQuiz = JSON.parse(fs.readFileSync('json/freemarkerQuiz.json', 'utf8'));

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/pub'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.send('Hello World!')
  console.log("request: " + request.body);
})

app.get('/frontend', function(request, response) {
  response.send('FrontEnd!');
  console.log("Frontend initialized");
  console.log("request: " + request.body);
})

app.post('/submit', function(request, response) {
  response.send('{data: "tbd"}');
  console.log("/SUBMIT");
  console.log("request: " + JSON.stringify(request.body, censor(request.body)));
})

app.post('/quiz-select', function(request, response) {
  console.log("/quiz-select");
  if (!request.body || !request.body.data) {
    console.log("error, invalid request");
    response.send({error: true, message: "invalid request", subMessage: "Please use the valid quizzes, do not try to come up with new ones :)"});
  } else {
      var selectedQuiz = request.body.data;
      console.log("selectedQuiz: " + selectedQuiz);
      response.send(loadQuiz(selectedQuiz));
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

function censor(censor) {
  var i = 0;

  return function(key, value) {
    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
      return '[Circular]';

    if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
      return '[Unknown]';

    ++i; // so we know we aren't using the original object anymore

    return value;
  }
}

function loadQuiz(selectedQuiz) {
    var quiz;
    switch (selectedQuiz) {
        case "javascript": quiz = javascriptQuiz; break;
        case "jdk8": quiz = jdk8Quiz; break;
        case "jdk9": quiz = jdk9Quiz; break;
        case "freemarker": quiz = freemarkerQuiz; break;
        default : return {error: true, message: "Invalid quiz request", subMessage: "the requested quiz unfortunately not exists yet. Come back later!"};
    }
    return quiz;
}
