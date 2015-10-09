(function() {
	document.addEventListener('DOMContentLoaded', function(event) { 
		var tables = document.getElementsByTagName('table');
		Array.prototype.forEach.call(tables, function(table) {
			var parent = table.parentNode,
				wrapper = document.createElement('div');

			wrapper.style.overflow = 'auto';
			parent.insertBefore(wrapper, table);
			parent.removeChild(table);
			wrapper.appendChild(table);
		});
	});
})();
