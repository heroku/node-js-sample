var express = require('express');


fs.readFile('index.html', function (err, data) {
  if (err) throw err;
  console.log(data);
});
