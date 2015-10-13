(function() {
	var videos;

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
	});
})();
