(function() {
	document.addEventListener('DOMContentLoaded', function(event) {
		var navElement = document.getElementsByClassName('primary-navigation')[0],
			subNav = document.getElementById('sub-nav'),
			subNavLinks = document.getElementsByClassName('with-sub-nav'),
			subNavElements = {},
			timers = {},
			transitionendEvent;

		if (!navElement.classList) {
			// Doesn't cut the mustard
			return;
		}

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

		function isHovered (elem) {
			return !!(elem.querySelector(":hover") || elem.parentNode.querySelector(":hover") === elem);
		}

		function isOpen (elem) {
			return elem.getAttribute('data-visible') === 'true' || !elem.classList.contains('is-hidden');
		}

		function showSubNav (id) {
			clearTimeout(timers[id]);
			timers[id] = setTimeout(function() {
				var visibleSibling = Object.keys(subNavElements).filter(function(key) {
					// Siblings only
					return key !== id;
				}).map(function(key) {
					// Now a list of the elements
					return subNavElements[key]
				}).filter(function(elem) {
					// Only the visible ones
					return isOpen(elem);
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
					subNavElements[id].setAttribute('data-visible', true);
				}

				if (visibleSibling) {
					visibleSibling.addEventListener(transitionendEvent, showNewSubNav, false);
				} else {
					showNewSubNav();
				}
			}, 100);
		}

		function hideSubNav (id) {
			clearTimeout(timers[id]);
			timers[id] = setTimeout(function() {
				subNavLinks[id].classList.remove('is-open');
				subNavElements[id].classList.add('is-hidden');
			}, 100);
		}

		if (subNavLinks.length) {
			subNavLinks = Array.prototype.reduce.call(subNavLinks, function(linksMap, subNavLink) {
				var id = subNavLink.getAttribute('data-sub-nav'),
					nope = false;

				linksMap[id] = subNavLink;

				subNavElements[id] = document.getElementById('sub-nav-' + id);

				function show () {
					showSubNav(id);
				}

				function hide () {
					hideSubNav(id);
				}

				function tappedAway () {
					if (nope) {
						nope = !nope;
						return;
					}

					if (isOpen(subNavElements[id])) {
						hide();
						document.body.removeEventListener('touchend', tappedAway);
					}
				}

				function showTap (e) {
					if (!isOpen(subNavElements[id])) {
						e.preventDefault();
					}
					show();
					document.body.addEventListener('touchend', tappedAway, false);
				}

				subNavElements[id].style.height = subNavElements[id].getBoundingClientRect().height + 'px';
				subNavElements[id].classList.add('is-hidden');
				subNavElements[id].classList.remove('measure-me');

				subNavLink.addEventListener('mouseenter', show, false);
				subNavLink.addEventListener('touchend', showTap, false);
				subNavLink.addEventListener('mouseleave', hide, false);
				subNavElements[id].addEventListener('mouseenter', show, false);
				subNavElements[id].addEventListener('touchend', function(e) {
					showTap(e);
					nope = true;
				}, false);
				subNavElements[id].addEventListener('mouseleave', hide, false);
				subNavElements[id].addEventListener(transitionendEvent, function() {
					subNavElements[id].setAttribute('data-visible', !subNavElements[id].classList.contains('is-hidden'));
				}, false);

				return linksMap;
			}, {});
		}
	});
})();
