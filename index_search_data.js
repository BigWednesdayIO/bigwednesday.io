'use strict';

var fs = require('fs');

var cheerio = require('cheerio');
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
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) {
        return console.error('Failed to read file ' + path + '. ' + err);
      }

      var $ = cheerio.load(data);

      var data = {
        title: $('head>title').text().replace(' | Big Wednesday IO', ''),
        meta_description: $('meta[name=description]').attr('content'),
        primary: $('.page-body__primary').text(),
        secondary: $('.page-body__secondary').text(),
        hero: $('.hero').text(),
      };

      request({url: indexUri, method: 'post', json: data})
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
});

