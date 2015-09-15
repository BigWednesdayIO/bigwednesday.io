(function() {
	var htmlClass = document.children[0].classList
	htmlClass.remove('no-js');
	htmlClass.add('js');

	document.addEventListener('DOMContentLoaded', function(event) { 
		var navElement = document.getElementsByClassName('primary-navigation')[0];
		var subNavLinks = document.getElementsByClassName('with-sub-nav');

		if (navElement) {
			document.getElementById('navicon').addEventListener('click', function() {
				navElement.classList.toggle('is-hidden');
			});
		}

		var timer = {},
			subNavElements = {};

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
	});
})();
