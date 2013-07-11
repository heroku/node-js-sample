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
var rest = require('restler');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://murmuring-ridge-1293.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
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
    program
	.version('0.0.1')
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Path to URL')
        .parse(process.argv);

    var f_option = false;
    var u_option = false;

    for(var i=0; i< process.argv.length; i++)
    {
      if(process.argv[i] == "-f"){ f_option = true;  }
      if(process.argv[i] == "-u"){ u_option = true;  }
    }

    var target='file';

    if( f_option && u_option)
    {
      console.log("Please specifg only one of following options [either <file> -f or <url> -u]");
      process.exit(1);
    }

   if(u_option&&program.url)
   { 
	rest.get(program.url).on('complete', function(result)
        {
	  if (result instanceof Error)
	  {
	    util.puts('Error: ' + result.message);
	    console.log("Check if url is valid and prefixed with http://...");
	    process.exit(1);
	  } 
	  else 
	  {
            var fs = require('fs');
            fs.writeFile("./tmp_url_index.html", result, function(err) 
            {
              if(err)
              {
       		 console.log(err);
              }
              else
              {
                 var checkJson = checkHtmlFile("./tmp_url_index.html", program.checks);
                 var outJson = JSON.stringify(checkJson, null, 4);
                 console.log(outJson);
              }
            }); 
             
  	  }
	});

     return;
   }
   else
   { 
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
   }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
