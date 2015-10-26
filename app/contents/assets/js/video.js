(function() {
	var videos;

	function removeControls (e) {
		e.target.removeAttribute('controls');
		e.target.removeEventListener('play', removeControls);
	}

	function playVideo () {
		Array.prototype.forEach.call(videos, function(video) {
			if (typeof video.getAttribute('autoplay') !== 'undefined') {
				video.play();
			}
		});
		document.body.removeEventListener('touchstart', playVideo);
	}

	document.addEventListener('DOMContentLoaded', function() {
		videos = document.getElementsByTagName('video');

		if (!videos.length) {
			return;
		}

		document.body.addEventListener('touchstart', playVideo);
		Array.prototype.forEach.call(videos, function(video) {
			if (video.getAttribute('controls') !== null && video.getAttribute('autoplay') !== null) {
				video.addEventListener('play', removeControls);
			}
		});

		if (Modernizr.video) {
			return;
		}

		// Fallback
		Array.prototype.forEach.call(videos, function(video) {
			var path = video.getAttribute('data-fallback'),
				fallback;

			if (path === null) {
				return;
			}

			fallback = document.createElement('img');
			fallback.src = path;
			video.appendChild(fallback);
		});
	});
})();
