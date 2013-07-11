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
var restler = require("restler");


var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};
var assertExists = function (inp) {
    var instr = inp.toString();
    if (instr.indexOf("http") == 0) {
        return instr;
    } else {
        return assertFileExists(inp);
    }
};

var cheerioHtmlFile = function(html) {
    return cheerio.load(html);
};

var loadChecks = function(checksfile) {
    return JSON.parse(removeBom(fs.readFileSync(checksfile).toString()));
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

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var removeBom = function(str) {
    var bomMarker = "ufeff";
    if (str.indexOf(bomMarker) == 0) {
        return str.substr(bomMarker.length);
    }else {
      return str;
    }
};
var process = function(html, checksFilePath) {
    var checkJson = checkHtmlFile(html, checksFilePath);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}; 
     
if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .parse(process.argv);
    var htmlPath = program["file"];
    var checksFilePath = program["checks"];
    if (htmlPath.indexOf("http") == 0) {
       restler.get(htmlPath).on("complete",function(resultOrError) {
           process(resultOrError, checksFilePath);
      });              
    } else {
       var html = fs.readFileSyn(htmlPath).toString();
       process(html, checksFilePath); 
    }
 } else {
      exports.checkHtmlFile = checkHtmlFile;
}   
