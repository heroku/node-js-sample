#! /usr/bin/env node

var fs = require('fs'),
    program = require('commander'),
    cheerio = require('cheerio'),
    HTML_DEFAULT = "index.html",
    CHECKSFILE_DEFAULT = "checks.json" ,
    rest = require('restler');

var assertFileExists = function(infile)
{
    var instr = infile.toString();
    if(!fs.existsSync(instr))  //fs.exitsSync() is synchronous version of fs.exists(path, callback) -> check whether or not a given path exists with the filesystem
    {
	console.log("%s does not exists. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile, url)
{
    if (url)
     {  return cheerio.load(htmlfile);
     }
    else
    {
      return cheerio.load(fs.readFileSync(htmlfile)); // cheerio is JQUERY for the server
    }
};

var loadChecks = function(checksfile)
{
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, url)
{
    $ = cheerioHtmlFile(htmlfile, url);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks)
    {
	var present =  $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn)
{
    return fn.bind({});
};

if (require.main == module)
{
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists),CHECKSFILE_DEFAULT )
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTML_DEFAULT)
	.option('-u, --url <url_link>', 'Url to html file')
	.parse(process.argv);
    if (program.url && !program.file)
    {
	console.log("Reading from url");
	rest.get(program.url).on('complete', function(response) {
		console.log(JSON.stringify(checkHtmlFile(response, program.checks, true), null, 4));
	});
    }
    else
    {
	console.log("Reading from html file");
	var checkJson = checkHtmlFile(program.file, program.checks, false);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
}
else
{
    exports.checkHtmlFile = checkHtmlFile;
}
