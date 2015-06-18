

exports.for = function (API) {

	var exports = {};

	exports.resolve = function (resolver, config, previousResolvedConfig) {

		return resolver({}).then(function (resolvedConfig) {

//console.log("RESOLVE PINF.space.genesis", JSON.stringify(resolvedConfig, null, 4));
//console.log("RAN!!!", resolvedConfig['$space.pinf.genesis/access/0']);
//console.log("RAN!!!", resolvedConfig['$space.pinf.genesis/access/0'].hello());

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
