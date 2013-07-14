/*####################
From node.js API docs (http://nodejs.org/api/fs.html#fs_fs_readfilesync_filename_options)
fs.readFileSync(filename, [options])
	Synchronous version of fs.readFile.  Returns the contents
	of the parameter filename.

	If the encoding option is specified then this function
	returns a string.  Otherwise, it returns a buffer.
####################*/

var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());


/*####################
From node.js API docs (http://nodejs.org/api/fs.html#fs_fs_readfilesync_filename_options)
fs.readFileSync(filename, [options])
	Synchronous version of fs.readFile.  Returns the contents
	of the parameter filename.

	If the encoding option is specified then this function
	returns a string.  Otherwise, it returns a buffer.
####################*/

app.get('/', function(request, response) {
	//get the contents of index.html
	var contents = fs.readFileSync("index.html");

	//response.send(string from previous step)
  response.send(contents.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});