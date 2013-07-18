#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.
 
References:
 
 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html
 
 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy
 
 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/
 
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');
 
// Checks to see if the file infile exists. If so, the returns file name. If not, then error.
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};
 
// Checks to see if the given URL exists. If so, the returns URL in string. If not, then error.
var assertURLExists = function(url) {
  var urlstr = url.toString();
  rest.get(urlstr).on('complete', function(result) {
    if (result instanceof Error) {
      console.log('Error: ' + result.message);
      this.retry(5000); // try again after 5 sec
    }
  });
  return urlstr;
}
 
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};
 
var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};
 
var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};
 
//
var checkURL = function(urlContents, checksfile) {
    $ = cheerio.load(urlContents);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};
 
 
var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};
 
if(require.main == module) {
 program
 .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
 .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
 .option('-u, --url <url>', 'path to herokuapp url', clone(assertURLExists))
// .option('-u, --url <url>', 'path to herokuapp url', clone(assertURLExists), CHECKSURL_DEFAULT)
 .parse(process.argv);
 
if(!program.url){ //original logic. file existing - index.html
 var checkJson = checkHtmlFile(program.file, program.checks);
 var outJson = JSON.stringify(checkJson, null, 4);
 console.log("required.main if : \n" + outJson);
 } else { // added
// rest.get(program.url).on('complete', function(result){
 var checkJson = checkURL(program.url, program.checks);
 var outJson = JSON.stringify(checkJson, null, 4);
 console.log("require.main else : \n" + outJson);
 };
 
} else {
 exports.checkHtmlFile = checkHtmlFile;
}
