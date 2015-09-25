(function() {
	function getSearchResults (search_params, callback) {
		var oReq = new XMLHttpRequest();

		oReq.addEventListener('load', function(response) {
			var responseData = JSON.parse(response.currentTarget.response);
			responseData.meta = search_params;
			callback(responseData);
		});

		oReq.open('POST', 'http://localhost:9001/1/indexes/big-wednesday-io-pages/query');
		oReq.setRequestHeader('Content-Type', 'application/json')
		oReq.send(JSON.stringify(search_params));
	}

	function highlightMatches (query, textBody) {
		var matchQuery = new RegExp('(\\W|\\b|-)(' + query.replace(/\W/g, '|') + ')(|-|s)(\\W|\\b)' , 'gi');

		return textBody.replace(matchQuery, function(match) {
			return '<strong>' + match + '</strong>';
		});
	}

	function generatePreview (textBody, length, query) {
		var preview;

		textBody = textBody.trim();
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
			listItem.className = 'media-item';

			text = document.createElement('div');
			text.className = 'media-item__text';
			listItem.appendChild(text);

			title = document.createElement('h3');
			title.className = 'media-item__title';
			text.appendChild(title);

			link = document.createElement('a');
			link.href = result.href;
			link.innerHTML = highlightMatches(results.meta.query, result.title);
			title.appendChild(link);

			preview = generatePreview(result.primary, 150, results.meta.query);
			if (preview) {
				previewHtml = document.createElement('p');
				previewHtml.className = 'media-item__preview';
				previewHtml.innerHTML = preview
				text.appendChild(previewHtml)
			}

			listItem.addEventListener('click', function() {
				link.click();
			});
			output.appendChild(listItem);
		});

		return output;
	}

	function setupInstantSearch (searchBox, instantResultsContainer) {
		searchBox.addEventListener('keyup', function() {
			var query = searchBox.value;

			if (query === '') {
				instantResultsContainer.innerHTML = '';
				return;
			}

			getSearchResults({
				query: searchBox.value,
				hitsPerPage: 5
			}, function(results) {
				var newResults;

				if (results.meta.query !== searchBox.value) {
					return;
				}

				newResults = instantResultsContainer.cloneNode();
				newResults.appendChild(formatResults(results));

				instantResultsContainer.parentNode.replaceChild(newResults, instantResultsContainer);
				instantResultsContainer = newResults;
			});
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
			if (!results.hits.length) {
				resultsContainer.innerHTML = 'No results matching "' + results.meta.query + '"';
				return;
			}

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
