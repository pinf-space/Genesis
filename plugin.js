

exports.for = function (API) {

	var exports = {};

	exports.resolve = function (resolver, config, previousResolvedConfig) {

		return resolver({}).then(function (resolvedConfig) {

//console.log("RESOLVE PINF.space.genesis", JSON.stringify(resolvedConfig, null, 4));
//console.log("RAN!!!", resolvedConfig['$space.pinf.genesis/access/0']);
//console.log("RAN!!!", resolvedConfig['$space.pinf.genesis/access/0'].hello());

resolvedConfig.t = Date.now();

			return resolvedConfig;
		});
	}

	exports.turn = function (resolvedConfig) {

		var origin = resolvedConfig["$space.pinf.genesis/origin/0"];

		return origin.getInviteToken().then(function (token) {

			console.log("Invite token", token);
		});
	}

	return exports;
}
