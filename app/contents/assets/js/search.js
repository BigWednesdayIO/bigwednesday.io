(function() {
	function getSearchResults (search_params, callback) {
		var oReq = new XMLHttpRequest(),
			timestamp = new Date();

		oReq.addEventListener('load', function(response) {
			var responseData = JSON.parse(response.currentTarget.response);
			responseData.meta = search_params;
			responseData.meta.timestamp = timestamp;
			callback(responseData);
		});

		oReq.open('POST', 'https://api.bigwednesday.io/1/search/indexes/big-wednesday-io-pages/query');
		oReq.setRequestHeader('Content-Type', 'application/json')
		oReq.setRequestHeader('Authorization', 'Bearer NG0TuV~u2ni#BP|')
		oReq.send(JSON.stringify(search_params));
	}

	function highlightMatches (query, textBody) {
		var matchQuery;

		query = query.split(/\W/g);
		query = query.map(function(word) {
			if (word[word.length - 1] === 's') {
				return word + '?';
			}
			return word;
		});
		matchQuery = new RegExp('(\\W|\\b|-)(' + query.join('|') + ')(|-|s)(\\W|\\b)' , 'gi');

		return textBody.replace(matchQuery, function(match) {
			return '<strong>' + match + '</strong>';
		});
	}

	function generatePreview (textBody, length, query) {
		var preview;

		textBody = textBody.replace(/\W+/mg, ' ').trim();
		preview = textBody.match(new RegExp('.{0,' + length + '}\\b'));

		if (!preview) {
			return null;
		}

		preview = preview[0].trim()

		if (query) {
			preview = highlightMatches(query, preview);
		}

		if (textBody.length > length) {
			preview += '&nbsp...';
		}

		return preview;
	}

	function getParameterByName (name) {
		var regex, results;
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
		results = regex.exec(window.location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function formatResults (results) {
		var output = document.createDocumentFragment()

		results.hits.forEach(function(result) {
			var listItem, text, title, link, preview, previewHtml;
			listItem = document.createElement('li');

			link = document.createElement('a');
			link.className = 'media-item media-item--highlight';
			link.href = result.href;
			listItem.appendChild(link);

			text = document.createElement('div');
			text.className = 'media-item__text';
			link.appendChild(text);

			title = document.createElement('h3');
			title.className = 'media-item__title';
			title.innerHTML = highlightMatches(results.meta.query, result.title);
			text.appendChild(title);

			preview = generatePreview(result.primary, 140, results.meta.query);
			if (preview) {
				previewHtml = document.createElement('p');
				previewHtml.className = 'media-item__preview';
				previewHtml.innerHTML = preview
				text.appendChild(previewHtml)
			}

			output.appendChild(listItem);
		});

		return output;
	}

	function setupInstantSearch (searchBox, instantResultsContainer) {
		var bigEnoughForSearch = window.matchMedia('(min-width: 768px)'),
			closeInstantSearch = function() {
				instantResultsContainer.innerHTML = '';
				document.body.removeEventListener('click', closeInstantSearch);
				console.log('body-click');
			},
			lastUpdated;

		document.getElementById('search-box').addEventListener('click', function(e) {
			e.stopPropagation();
		});

		searchBox.addEventListener('keyup', function(e) {
			var query = searchBox.value;

			if (query === '' || !bigEnoughForSearch.matches || (e.charCode || e.keyCode) === 27) {
				instantResultsContainer.innerHTML = '';
				return;
			}

			getSearchResults({
				query: searchBox.value,
				hitsPerPage: 5
			}, function(results) {
				var newResults;

				if (lastUpdated && lastUpdated >= results.meta.timestamp) {
					return;
				}

				lastUpdated = results.meta.timestamp;

				newResults = instantResultsContainer.cloneNode();
				newResults.appendChild(formatResults(results));

				instantResultsContainer.parentNode.replaceChild(newResults, instantResultsContainer);
				instantResultsContainer = newResults;
			});

			document.body.addEventListener('click', closeInstantSearch);
		});
	}

	function setupResultsPage (resultsContainer) {
		var query = getParameterByName('query')

		if (!query || query === '') {
			return;
		}

		getSearchResults({
			query: query
		}, function(results) {
			var title;

			if (!results.hits.length) {
				resultsContainer.innerHTML = 'No results matching "' + results.meta.query + '"';
				return;
			}

			title = document.getElementsByTagName('h1')[0];
			title.innerHTML = title.innerHTML + ' for "' + results.meta.query + '"';

			resultsContainer.appendChild(formatResults(results));
		});
	}

	document.addEventListener('DOMContentLoaded', function() {
		var searchBox = document.getElementById('search'),
			resultsContainer = document.getElementById('search-results'),
			instantResultsContainer = document.getElementById('instant-search-results');

		if (searchBox && instantResultsContainer) {
			setupInstantSearch(searchBox, instantResultsContainer);
		}

		if (resultsContainer) {
			setupResultsPage(resultsContainer);
		}
	});
})();
