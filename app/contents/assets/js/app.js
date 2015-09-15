(function() {
	var htmlClass = document.children[0].classList
	htmlClass.remove('no-js');
	htmlClass.add('js');

	document.addEventListener('DOMContentLoaded', function(event) { 
		var navElement = document.getElementsByClassName('primary-navigation')[0];
		var subNavElement = document.getElementsByClassName('sub-nav')[0];
		var productsLink = document.getElementById('products-link');

		if (navElement) {
			document.getElementById('navicon').addEventListener('click', function() {
				navElement.classList.toggle('is-hidden');
			});
		}

		var timer;

		function showSubNav () {
			clearTimeout(timer);
			timer = setTimeout(function() {
				productsLink.classList.add('is-open')
				subNavElement.classList.remove('is-hidden');
			}, 100);
		}

		function hideSubNav () {
			clearTimeout(timer);
			timer = setTimeout(function() {
				productsLink.classList.remove('is-open')
				subNavElement.classList.add('is-hidden');
			}, 100);
		}

		if (subNavElement) {
			productsLink.addEventListener('mouseenter', showSubNav);
			productsLink.addEventListener('mouseleave', hideSubNav);
			subNavElement.addEventListener('mouseenter', showSubNav);
			subNavElement.addEventListener('mouseleave', hideSubNav);
		}
	});
})();
