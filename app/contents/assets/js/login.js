(function() {
	document.addEventListener('DOMContentLoaded', function(event) { 
		var loginForm = document.getElementById('login-form');

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
