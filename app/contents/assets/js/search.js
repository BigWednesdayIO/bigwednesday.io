(function() {
	function getSearchResults (index, search_params, callback) {
		var oReq = new XMLHttpRequest(),
			timestamp = new Date();

		oReq.addEventListener('load', function(response) {
			var responseData = JSON.parse(response.currentTarget.response);
			responseData.meta = search_params;
			responseData.meta.timestamp = timestamp;
			callback(responseData);
		});

		oReq.open('POST', 'https://api.bigwednesday.io/1/search/indexes/big-wednesday-io-' + index + '/query');
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

		if (!textBody) {
			return null;
		}

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
			var listItem, icon, text, title, link, preview, previewHtml;
			listItem = document.createElement('li');

			link = document.createElement('a');
			link.className = 'media-item media-item--highlight';
			link.href = result.href;
			listItem.appendChild(link);

			if (result.icon) {
				icon = document.createElement('div');
				icon.className = 'media-item__icon';
				icon.innerHTML = '<svg height="28" width="28"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#' + result.icon + '"></use></svg>';
				link.appendChild(icon);
			}

			text = document.createElement('div');
			text.className = 'media-item__text';
			link.appendChild(text);

			title = document.createElement('h3');
			title.className = 'media-item__title';
			title.innerHTML = highlightMatches(results.meta.query, result.title || result.name);
			text.appendChild(title);

			preview = generatePreview(result.primary || result.description, 140, results.meta.query);
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
			resultsLists = document.getElementsByClassName('instant-search-results-container');

		function closeInstantSearch () {
			instantResultsContainer.style.display = 'none';
			document.body.removeEventListener('click', closeInstantSearch);
		}

		function performInstantSearch (e) {
			var query = searchBox.value;

			if (query === '' || !bigEnoughForSearch.matches || (e.charCode || e.keyCode) === 27) {
				closeInstantSearch();
				return;
			}

			instantResultsContainer.style.display = '';

			resultsLists.forEach(function(list) {
				getSearchResults(list.index ,{
					query: searchBox.value,
					hitsPerPage: 3
				}, function(results) {
					var newResults;

					if (list.lastUpdated && list.lastUpdated >= results.meta.timestamp) {
						return;
					}

					if (!results.hits.length) {
						list.element.parentNode.style.display = 'none';
						return;
					}

					list.element.parentNode.style.display = '';

					list.lastUpdated = results.meta.timestamp;

					newResults = list.element.cloneNode();
					newResults.appendChild(formatResults(results));

					list.element.parentNode.replaceChild(newResults, list.element);
					list.element = newResults;
				});
			});

			document.body.addEventListener('click', closeInstantSearch);
		}

		document.getElementById('search-box').addEventListener('click', function(e) {
			e.stopPropagation();
		});

		resultsLists = Array.prototype.map.call(resultsLists, function(list) {
			return {
				element: list,
				index: list.getAttribute('data-index'),
				lastUpdated: null
			};
		});

		searchBox.addEventListener('keyup', performInstantSearch);
		searchBox.addEventListener('change', performInstantSearch);
	}

	function setupResultsPage (resultsContainers) {
		var query = getParameterByName('query'),
			title;

		if (!query || query === '') {
			return;
		}

		title = document.getElementsByTagName('h1')[0];
		title.innerHTML = title.innerHTML + ' for "' + query + '"';

		Array.prototype.forEach.call(resultsContainers, function(resultsContainer) {
			getSearchResults(resultsContainer.id, {
				query: query
			}, function(results) {
				if (!results.hits.length) {
					return;
				}

				resultsContainer.appendChild(formatResults(results));
				resultsContainer.parentNode.style.display = '';
			});
		});
	}

	document.addEventListener('DOMContentLoaded', function() {
		var searchBox = document.getElementById('search'),
			resultsContainers = document.getElementsByClassName('search-results-container'),
			instantResultsContainer = document.getElementById('instant-search-results');

		if (searchBox && instantResultsContainer && 'matchMedia' in window) {
			setupInstantSearch(searchBox, instantResultsContainer);
		}

		if (resultsContainers.length) {
			setupResultsPage(resultsContainers);
		}
	});
})();
