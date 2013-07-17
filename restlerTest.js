#!/usr/bin/env node

/*Pulls html from http://google.com and saves it to file temp.html
Utilizes restler library for get() call.
Utilizes commander library for .option functionality

*/



var sys = require('util'),
    rest = require('restler'),
    program = require('commander'),
    fs = require('fs');

function saveHtmlToFile (url, filename) {
	rest.get(url).on('complete', function(result) {
	  if (result instanceof Error) {
	    sys.puts('Error: ' + result.message);
	    this.retry(5000); // try again after 5 sec
	  } else {    
	    fs.writeFileSync(filename, result);
	  }
	});
}

/*program with the option -u or --url which takes a given URL and saves the file to the option -f or --file*/
if(require.main == module) {
    program
        //.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html')//, clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL')//todo:define url and add clone(assert) call and add URL_DEFAULT
        .parse(process.argv);
    //var checkJson = checkHtmlFile(program.file, program.checks);
    //var outJson = JSON.stringify(checkJson, null, 4);
    console.log(program.url);
    if (program.url) saveHtmlToFile(program.url, program.file);
} else {
    console.log("Else.");
    //exports.checkHtmlFile = checkHtmlFile;
}


/*// 2013-07-17 This is the code from before I cut/pasted into the function.

rest.get('http://google.com').on('complete', function(result) {
  if (result instanceof Error) {
    sys.puts('Error: ' + result.message);
    this.retry(5000); // try again after 5 sec
  } else {
    
    fs.writeFileSync("temp.html", result);
  }
});*/

