'use strict';

var fs = require('fs');

var cheerio = require('cheerio');
var request = require('request');
var glob = require('glob');

var pagesDirectory = 'build';
var productsDirectory = pagesDirectory + '/products';

var preRequisiteErrors = [];

try {
  var stat = fs.statSync(pagesDirectory);

  if (!stat.isDirectory()) {
    preRequisiteErrors.push(pagesDirectory + ' is not a directory. Please ensure that the site has been built first.');
  }
}
catch(e) {
  preRequisiteErrors.push('Directory ' + pagesDirectory+ ' does not exist. Please ensure that the site has been built first.');
}

if (!process.env.SEARCH_API) {
  preRequisiteErrors.push('Please set the search API URI in environment variable "SEARCH_API.');
}

if (!process.env.SEARCH_API_TOKEN) {
  preRequisiteErrors.push('Please set the search API token for indexing in the environment variable "SEARCH_API_TOKEN".')
}

if (preRequisiteErrors.length) {
  console.error('Failed!');

  preRequisiteErrors.forEach(function(e) {
    console.error(e);
  });

  return;
}

var getFiles = function(directory) {
  return new Promise(function(resolve) {
    glob(directory + '/**/*.html', function(err, files) {
      if (err) {
        console.err(err);
        return reject(err);
      }

      resolve(files);
    });
  });
};

var createIndexJobs = function(files, indexUri, buildIndexObject) {
  return files.map(function(path) {
    return new Promise(function(resolve) {
      fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
          return console.error('Failed to read file ' + path + '. ' + err);
          resolve();
        }

        var data = buildIndexObject(data, path);
        var headers = {
          'content-type': 'application/json',
          authorization: 'bearer ' + process.env.SEARCH_API_TOKEN
        };

        request({url: indexUri, method: 'post', headers: headers, json: data})
          .on('response', function(response) {
            if (response.statusCode.toString().indexOf('2') === 0) {
              console.log(path + ' - indexed');
            } else {
              console.error(path + ' - failed: ' + response.statusCode);
            }

            resolve();
          })
          .on('error', function(err) {
            console.error(path + ' - failed: ' + err);
            resolve();
          });
      });
    });
  });
};

var toHref = function(path) {
  var href = path.substring(5).replace('/index.html', '');

  return href ? href : '/';
};

var buildPageObject = function(page, path) {
  var $ = cheerio.load(page);

  var data = {
    href: toHref(path),
    title: $('head>title').text().replace(' | Big Wednesday IO', ''),
    meta_description: $('meta[name=description]').attr('content'),
    primary: $('.page-body__primary').text(),
    secondary: $('.page-body__secondary').text(),
    hero: $('.hero').text(),
  };

  if (!data.href) {
    data.href = '/';
  }

  return data;
};

var buildProductObject = function(productPage, path) {
  var $ = cheerio.load(productPage);

  return {
    href: toHref(path),
    name: $('h1').text(),
    meta_description: $('meta[name=description]').attr('content'),
  };
}

Promise.all([getFiles(pagesDirectory), getFiles(productsDirectory)])
  .then(function(res) {
    var pages = res[0];
    var products = res[1].filter(function(productPagePath) {
      return productPagePath !== 'build/products/index.html';
    });

    var pagesIndexUri = process.env.SEARCH_API + '/1/indexes/big-wednesday-io-pages';
    console.log('Indexing pages from ' + pagesDirectory + '/ to ' + pagesIndexUri);

    return Promise.all(createIndexJobs(pages, pagesIndexUri, buildPageObject))
      .then(function() {
        var productsIndexUri = process.env.SEARCH_API + '/1/indexes/big-wednesday-io-products';
        console.log('Indexing products from ' + productsDirectory + '/ to ' + productsIndexUri);

        return Promise.all(createIndexJobs(products, productsIndexUri, buildProductObject));
      });
  });
