(function() {
	document.addEventListener('DOMContentLoaded', function() {
		var heros = document.getElementsByClassName('hero--random');

		if (!heros.length) {
			return;
		}

		Array.prototype.forEach.call(heros, function(hero) {
			var src = hero.getAttribute('data-src') || '/assets/images/hero--personalisation-$i.jpg',
				count = hero.getAttribute('data-count') || 4,
				img,
				i;

			if (src === null || count === null) {
				return;
			}

			count = parseInt(count, 10);
			i = Math.ceil(Math.random() * count);
			src = src.replace('$i', i);
			img = document.createElement('img');
			img.src = src;

			hero.style.backgroundImage = 'url(' + src + ')';
		});
	});
})();
