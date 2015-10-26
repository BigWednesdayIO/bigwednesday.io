module.exports = function(str) {
	if (!str) {
		return '';
	}

   return str.split('.')[0];
}
