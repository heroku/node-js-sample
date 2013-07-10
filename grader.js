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
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = [];
var graded_file = [];

var assertFileExists = function(infile) {
    var instr = infile.toString();
//console.log('assertFileExists for %s', instr);
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(infile) {
    var instr = infile.toString();
//console.log('assertUrlExists for %s', instr);
    HTMLFILE_DEFAULT = '+' + HTMLFILE_DEFAULT;
    if (fs.existsSync(HTMLFILE_DEFAULT)) {
        fs.unlinkSync(HTMLFILE_DEFAULT);
    }
    rest.get(instr).on('complete', function(data, response) {
        if (data instanceof Error) {
            console.log('Error: ' + data.message);
            process.exit(1);
        } else if (response.statusCode != 200) {
            console.log('HTML get Error:' + response.statusCode);
            process.exit(1);
        } else {
            console.log('rest.get file %s', HTMLFILE_DEFAULT);
	    fs.writeFileSync(HTMLFILE_DEFAULT, data);
            program.file = HTMLFILE_DEFAULT;
//            console.log("html file %s check file %s", program.file, program.checks);
            var checkJson = checkHtmlFile(program.file, program.checks);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
	}
    });
    return instr;

};

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

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};



if(require.main == module) {
    program.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT);
    program.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT);
    program.option('-u  --url <url>', 'url to get', clone(assertUrlExists), URLFILE_DEFAULT);

    program.parse(process.argv);
    if (program.url.length == 0) {
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    } else {
        exports.checkHtmlFile = checkHtmlFile;
    }

}
