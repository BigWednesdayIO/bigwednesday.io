(function() {
	document.addEventListener('DOMContentLoaded', function(event) {
		var navElement = document.getElementsByClassName('primary-navigation')[0],
			subNav = document.getElementById('sub-nav'),
			subNavLinks = document.getElementsByClassName('with-sub-nav'),
			subNavElements = {},
			transitionendEvent;

		transitionendEvent = (function whichTransitionEvent () {
			var t,
				el = document.createElement('fakeelement');

			var transitions = {
				transition : 'transitionend',
				OTransition : 'oTransitionEnd',
				MozTransition : 'transitionend',
				WebkitTransition: 'webkitTransitionEnd'
			}

			for (t in transitions) {
				if (typeof el.style[t] !== 'undefined') {
					return transitions[t];
				}
			}
		})();

		if (navElement) {
			document.getElementById('navicon').addEventListener('click', function() {
				navElement.classList.toggle('is-hidden');
			});
		}

		function isHovered (elm) {
			return !!(elm.querySelector(":hover") || elm.parentNode.querySelector(":hover") === elm);
		}

		function showSubNav (id) {
			var visibleSibling = Object.keys(subNavElements).filter(function(key) {
				// Siblings only
				return key !== id;
			}).map(function(key) {
				// Now a list of the elements
				return subNavElements[key]
			}).filter(function(elem) {
				// Only the visible ones
				return elem.dataset.visible === 'true' || !elem.classList.contains('is-hidden');
			})[0];

			var showNewSubNav = function() {
				// Fires once
				if (visibleSibling) {
					visibleSibling.removeEventListener(transitionendEvent, showNewSubNav, false);
				}

				if (!isHovered(subNavLinks[id]) && !isHovered(subNavElements[id])) {
					// if this element is no longer being hovered, don't show
					return;
				}

				subNavLinks[id].classList.add('is-open');
				subNavElements[id].classList.remove('is-hidden');
				subNavElements[id].dataset.visible = true;
			}

			if (visibleSibling) {
				visibleSibling.addEventListener(transitionendEvent, showNewSubNav, false);
			} else {
				showNewSubNav();
			}
		}

		function hideSubNav (id) {
			subNavLinks[id].classList.remove('is-open');
			subNavElements[id].classList.add('is-hidden');
		}

		if (subNavLinks.length) {
			subNavLinks = Array.prototype.reduce.call(subNavLinks, function(linksMap, subNavLink) {
				var id = subNavLink.getAttribute('data-sub-nav');
				linksMap[id] = subNavLink;

				subNavElements[id] = document.getElementById('sub-nav-' + id);

				function show () {
					showSubNav(id);
				}

				function hide () {
					hideSubNav(id);
				}

				subNavElements[id].style.height = subNavElements[id].getBoundingClientRect().height + 'px';
				subNavElements[id].classList.add('is-hidden');
				subNavElements[id].classList.remove('measure-me');

				subNavLink.addEventListener('mouseenter', show, false);
				subNavLink.addEventListener('mouseleave', hide, false);
				subNavElements[id].addEventListener('mouseenter', show, false);
				subNavElements[id].addEventListener('mouseleave', hide, false);
				subNavElements[id].addEventListener(transitionendEvent, function() {
					subNavElements[id].dataset.visible = !subNavElements[id].classList.contains('is-hidden');
				}, false);

				return linksMap;
			}, {});
		}
	});
})();
