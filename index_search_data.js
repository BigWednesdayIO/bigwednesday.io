'use strict';

var fs = require('fs');
var request = require('request');
var glob = require('glob');

var directory = 'build';

var preRequisiteErrors = [];

try {
  var stat = fs.statSync(directory);

  if (!stat.isDirectory()) {
    preRequisiteErrors.push(directory + ' is not a directory. Please ensure that the site has been built first.');
  }
}
catch(e) {
  preRequisiteErrors.push('Directory ' + directory+ ' does not exist. Please ensure that the site has been built first.');
}

if (!process.env.SEARCH_API) {
  preRequisiteErrors.push('Please set the search API URI in environment variable "SEARCH_API" and try again.');
}

if (preRequisiteErrors.length) {
  console.error('Failed!');

  preRequisiteErrors.forEach(function(e) {
    console.error(e);
  });

  return;
}

var indexUri = process.env.SEARCH_API + '/1/indexes/big-wednesday-io';

console.log('Indexing files from ' + directory + ' to ' + indexUri);

glob(directory + '/**/*.html', function(err, files) {
  files.forEach(function(path) {
    request({url: indexUri, method: 'post', json: {file: path}})
      .on('response', function(response) {
        if (response.statusCode.toString().indexOf('2') === 0) {
          return console.log(path + ' - indexed');
        }

        console.error(path + ' - failed: ' + response.statusCode);
      })
      .on('error', function(err) {
        console.error(path + ' - failed: ' + err);
      });
  });
});

