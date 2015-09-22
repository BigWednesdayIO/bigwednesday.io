(function() {
	document.addEventListener('DOMContentLoaded', function(event) {
		var navElement = document.getElementsByClassName('primary-navigation')[0],
			subNav = document.getElementById('sub-nav'),
			subNavLinks = document.getElementsByClassName('with-sub-nav'),
			timer,
			openSiblingsTimer,
			subNavElements = {};

		if (navElement) {
			document.getElementById('navicon').addEventListener('click', function() {
				navElement.classList.toggle('is-hidden');
			});
		}

		function showSubNav (id) {
			clearTimeout(timer);
			timer = setTimeout(function() {
				var openSiblings = subNav.getElementsByClassName('is-visible');

				if (openSiblings.length) {
					Array.prototype.forEach.call(openSiblings, function(openSibling) {
						openSibling.classList.remove('is-visible');
					});
				}

				subNavElements[id].classList.add('is-visible');
				subNavLinks[id].classList.add('is-open');
				subNav.classList.remove('is-hidden');
				subNav.tabIndex = 0;
			}, 100);
		}

		function hideSubNav (id) {
			clearTimeout(timer);
			timer = setTimeout(function() {
				subNavLinks[id].classList.remove('is-open')
				subNav.classList.add('is-hidden');
				subNavElements[id].classList.add('is-hidden');
				subNav.tabIndex = -1;
				openSiblingsTimer = setTimeout(function() {
					subNavLinks[id].classList.remove('is-open');
				}, 25);
			}, 100);
		}

		if (subNavLinks.length) {
			subNavLinks = Array.prototype.reduce.call(subNavLinks, function(linksMap, subNavLink) {
				var id = subNavLink.dataset.subNav;
				linksMap[id] = subNavLink;

				subNavElements[id] = document.getElementById('sub-nav-' + id);

				function show () {
					showSubNav(id);
				}

				function hide () {
					hideSubNav(id);
				}

				subNavLink.addEventListener('mouseenter', show);
				subNavLink.addEventListener('mouseleave', hide);
				subNavElements[id].addEventListener('mouseenter', show);
				subNavElements[id].addEventListener('mouseleave', hide);

				return linksMap;
			}, {});
		}
	});
})();
