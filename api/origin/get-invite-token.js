

require('org.pinf.genesis.lib/lib/api').forModule(require, module, function (API, exports) {


	var InviteToken = function () {
		this.$PLComponent = "space.pinf.genesis/origin.get-invite-token/0";
	}
	InviteToken.prototype.getLabel = function () {
		return this.label || "PINF.Space.Genesis / Origin / Get invite token";
	}
	InviteToken.prototype.run = function () {

//console.log("RUNING INVITE TOKEN!", this);

//console.log("INIT INVITE TOKEN!", this);

		return "RUN INVITE TOKEN COMMAND!";
	}


	exports.PLComponent = function (config, groupConfig) {

//console.log("config", config);

		return {
			"$space.pinf.genesis/origin.get-invite-token/0": API.EXTEND(true, new InviteToken(), config)
		};
	}

});

