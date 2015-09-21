(function() {
	var htmlClass = document.children[0].classList
	htmlClass.remove('no-js');
	htmlClass.add('js');

	document.addEventListener('DOMContentLoaded', function(event) { 
		var navElement = document.getElementsByClassName('primary-navigation')[0],
			subNavLinks = document.getElementsByClassName('with-sub-nav'),
			loginForm = document.getElementById('login-form'),
			timer = {},
			subNavElements = {};

		if (navElement) {
			document.getElementById('navicon').addEventListener('click', function() {
				navElement.classList.toggle('is-hidden');
			});
		}

		function showSubNav (id) {
			clearTimeout(timer[id]);
			timer[id] = setTimeout(function() {
				subNavLinks[id].classList.add('is-open')
				subNavElements[id].classList.remove('is-hidden');
			}, 100);
		}

		function hideSubNav (id) {
			clearTimeout(timer[id]);
			timer[id] = setTimeout(function() {
				subNavLinks[id].classList.remove('is-open')
				subNavElements[id].classList.add('is-hidden');
			}, 50);
		}

		if (subNavLinks.length) {
			subNavLinks = Array.prototype.reduce.call(subNavLinks, function(linksMap, subNavLink) {
				var id = subNavLink.dataset.subNav;
				linksMap[id] = subNavLink;

				subNavElements[id] = document.getElementById('sub-nav-' + id);

				subNavLink.addEventListener('mouseenter', function() {
					showSubNav(id);
				});
				subNavLink.addEventListener('mouseleave', function() {
					hideSubNav(id);
				});
				subNavElements[id].addEventListener('mouseenter', function() {
					showSubNav(id);
				});
				subNavElements[id].addEventListener('mouseleave', function() {
					hideSubNav(id);
				});

				return linksMap;
			}, {});
		}

		if (loginForm) {
			loginForm.addEventListener('submit', function(e) {
				var oReq = new XMLHttpRequest();

				e.preventDefault();

				function handleResponse (response) {
					var responseBody;

					if ([200, 201].indexOf(response.currentTarget.status) === -1) {
						return handleError(response);
					}

					window.location = JSON.parse(response.currentTarget.response).redirect;
				}

				function handleError (response) {
					var errors = loginForm.getElementsByClassName('error'),
						error,
						formRows;

					if (errors.length) {
						error = errors[0];
					} else {
						error = document.createElement('li');
						error.classList.add('form-row', 'error');
					}

					error.textContent = 'The email or password you entered is incorrect.';

					if (errors.length) {

					} else {
						formRows = loginForm.getElementsByClassName('form-rows')[0];
						formRows.insertBefore(error, formRows.firstChild);
					}
				}

				oReq.addEventListener('load', handleResponse);
				oReq.addEventListener('error', handleError);

				oReq.open(loginForm.method, loginForm.action);
				oReq.send(new FormData(loginForm));
			});
		}
	});
})();
