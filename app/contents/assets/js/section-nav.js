(function() {
	if (Modernizr.csspositionsticky) {
		return;
	}

	document.addEventListener('DOMContentLoaded', function(event) {
		var sectionNav = document.getElementsByClassName('section-nav')[0],
			pageBody = document.getElementsByClassName('page-body')[0],
			sectionNavClasses,
			pageBodyPosition;

		if (!sectionNav || !pageBody) {
			return;
		}

		sectionNavClasses = sectionNav.classList;
		pageBodyPosition = pageBody.offsetTop;

		window.addEventListener('scroll', function() {
			if (window.pageYOffset >= pageBodyPosition) {
				sectionNavClasses.add('is-sticky');
			} else {
				sectionNavClasses.remove('is-sticky');
			}
		});
	});
})();
