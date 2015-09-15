document.addEventListener('DOMContentLoaded', function(event) { 
	var navElement = document.getElementsByClassName('primary-navigation')[0];

	if (navElement) {
		document.getElementById('navicon').addEventListener('click', function() {
			navElement.classList.toggle('is-hidden');
		});
	}
});

