#!/usr/bin/env node

/*Pulls html from http://google.com and saves it to file temp.html*/

var sys = require('util'),
    rest = require('restler'),
    fs = require('fs');



rest.get('http://google.com').on('complete', function(result) {
  if (result instanceof Error) {
    sys.puts('Error: ' + result.message);
    this.retry(5000); // try again after 5 sec
  } else {
    
    fs.writeFileSync("temp.html", result);
  }
});

