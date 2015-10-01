module.exports = function(raw) {
	return raw.toLowerCase().replace(/[^\w]+/g, '-')
};
