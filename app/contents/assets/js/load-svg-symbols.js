(function() {
	document.addEventListener('DOMContentLoaded', function() {
		var body = document.getElementsByTagName('body')[0],
			oReq = new XMLHttpRequest();

		function handleResponse (response) {
			var svgSymbols = document.createElement('div');
			svgSymbols.style.display = 'none';
			svgSymbols.innerHTML = response.currentTarget.response;
			body.insertBefore(svgSymbols, body.firstChild);
		}

		oReq.addEventListener('load', handleResponse);

		oReq.open('GET', document.getElementById('svg-symbols').href);
		oReq.send();
	});
})();
