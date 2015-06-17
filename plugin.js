

exports.for = function (API) {

	var exports = {};

	exports.resolve = function (resolver, config, previousResolvedConfig) {

		return resolver({}).then(function (resolvedConfig) {

console.log("RESOLVE PINF.space.genesis", resolvedConfig);

process.exit(1);

			return resolvedConfig;
		});
	}

	exports.turn = function (resolvedConfig) {

		return API.Q.denodeify(function (callback) {

//console.log ("TURN PIO PROFILE", resolvedConfig);

			return callback(null);
		})();
	}

	return exports;
}
