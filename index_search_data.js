'use strict';

var fs = require('fs');

var cheerio = require('cheerio');
var request = require('request');
var glob = require('glob');

var pagesDirectory = 'build';
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

var productsDirectory = pagesDirectory + '/products';
var indexBaseUri = process.env.SEARCH_API + '/1/indexes/';
var pagesIndex = 'big-wednesday-io-pages';
var productsIndex = 'big-wednesday-io-products';
var pagesIndexUri = indexBaseUri + pagesIndex;
var productsIndexUri = indexBaseUri + productsIndex;
var apiHeaders = {
  'content-type': 'application/json',
  authorization: 'bearer ' + process.env.SEARCH_API_TOKEN
};

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

        request({url: indexUri, method: 'post', headers: apiHeaders, json: data})
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
    description: $('meta[name=description]').attr('content'),
  };
}

var deleteIndex = function(name) {
  return new Promise(function(resolve, reject) {
    request({url: indexBaseUri + name, method: 'delete', headers: apiHeaders})
      .on('response', function(response) {
        if (response.statusCode.toString().indexOf('2') === 0 || response.statusCode === 404) {
          return resolve();
        }

        console.error('Delete of index ' + name + ' failed - ' + response.statusCode);
        reject();
      })
      .on('error', function(err) {
        console.error('Delete of index ' + name + ' failed');
        console.error(err);
        reject();
      });
  });
};

Promise.all([getFiles(pagesDirectory), getFiles(productsDirectory)])
  .then(function(res) {
    console.log('Deleting existing indexes');

    return Promise.all([deleteIndex(pagesIndex), deleteIndex(productsIndex)])
      .then(function() {
        return res;
      });
  })
  .then(function(res) {
    var pages = res[0];
    var products = res[1].filter(function(productPagePath) {
      // the products list page is not a product!
      return productPagePath !== 'build/products/index.html';
    });

    console.log('Indexing pages from ' + pagesDirectory + '/ to ' + pagesIndexUri);

    return Promise.all(createIndexJobs(pages, pagesIndexUri, buildPageObject))
      .then(function() {
        console.log('Indexing products from ' + productsDirectory + '/ to ' + productsIndexUri);

        return Promise.all(createIndexJobs(products, productsIndexUri, buildProductObject));
      });
  });
