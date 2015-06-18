
require('org.pinf.genesis.lib/lib/api').forModule(require, module, function (API, exports) {


	const Access_PRIVATE = {

		ready: function (config, privateConfig) {
			var api = API.EXTEND(false, {}, Access_PRIVATE, config, privateConfig);
			if (
				api["@impl"] &&
				api["@impl"]["$space.pinf.genesis/access/0"]
			) {
				API.EXTEND(false, api, api["@impl"]["$space.pinf.genesis/access/0"]);
			}
			return API.Q.resolve(api);
		},

		download: function (filename) {
			var self = this;
			return API.Q.reject(new Error("'download' must be implemented by @impl!"));
		},
		upload: function (filename, data) {
			var self = this;
			return API.Q.reject(new Error("'download' must be implemented by @impl!"));
		}
	}


	var Access = function (origin) {
		var self = this;

		self.$PLComponent = "space.pinf.genesis/access/0";

		var privateConfig = {
			origin: origin
		}

		function privateAPI () {
			return Access_PRIVATE.ready(self, privateConfig);
		}

		self.download = function (filename) {
			return privateAPI().then(function (api) {
				return api.download(filename);
			});
		}
		self.upload = function (filename, data) {
			return privateAPI().then(function (api) {
				return api.upload(filename, data);
			});
		}

	}


	exports.PLComponent = function (config, groupConfig) {

		return {
			"$space.pinf.genesis/access/0": API.EXTEND(true, new Access(
				groupConfig['$space.pinf.genesis/origin/0']
			), config)
		};
	}

});


