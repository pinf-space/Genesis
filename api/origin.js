

require('org.pinf.genesis.lib/lib/api').forModule(require, module, function (API, exports) {

	const SSH = API.SSH.for(API);


	const Origin_PRIVATE = {

		ready: function (config, privateConfig) {
			var api = API.EXTEND(false, {}, Origin_PRIVATE, config, privateConfig);
			if (
				api["@impl"] &&
				api["@impl"]["$space.pinf.genesis/origin/0"]
			) {
				API.EXTEND(false, api, api["@impl"]["$space.pinf.genesis/origin/0"]);
			}
			return api.ensurePrivateKey().then(function () {
				return api.ensurePublicKey();
			}).then(function () {
				return api;
			});
		},

		derivePublicKeyPath: function () {
			var self = this;
			return API.Q.resolve(self.secret.keyPath + ".pub");
		},

		ensurePrivateKey: function (verify) {
			var self = this;
			// TODO: Add password to private key once we know that toolchain can use
			//       password agent at all times (or export private key without password temporarily only)
			return API.Q_IO.exists(self.secret.keyPath).then(function (exists) {
				if (exists) return;

				if (verify) {
					throw new Error("Generated private key but could not find afterwards.");
				}

				return self.derivePublicKeyPath().then(function (keyPubPath) {

					if (API.FS.existsSync(keyPubPath)) {
						API.FS.removeSync(keyPubPath);
					}
					return SSH.generateKeys(self.secret.keyPath).then(function () {
						if (API.FS.existsSync(keyPubPath)) {
							API.FS.removeSync(keyPubPath);
						}
						return self.ensurePrivateKey(true);
					});
				});
			});
		},

		ensurePublicKey: function (verify) {
			var self = this;
			return self.derivePublicKeyPath().then(function (keyPubPath) {
				return API.Q_IO.exists(keyPubPath).then(function (exists) {
					if (exists) return;
					if (verify) {
						throw new Error("Generated public key but could not find afterwards.");
					}
					return SSH.exportPublicKeyFromPrivateKey(
						self.secret.keyPath,
						keyPubPath,
						self.label
					).then(function () {
						return self.ensurePublicKey(verify);
					});
				});
			});
		},

		derivePublicPem: function () {
			var self = this;
			return API.Q.fcall(function () {
				// TODO: Cache this if private key path and value has not changed.
				var privateKey = API.FS.readFileSync(self.secret.keyPath, "utf8");
				var privateKeyObject = API.FORGE.pki.privateKeyFromAsn1(
					API.FORGE.asn1.fromDer(
						API.FORGE.util.decode64(
							privateKey
							.match(/^-----BEGIN RSA PRIVATE KEY-----\n([^-]+)\n-----END RSA PRIVATE KEY-----\n?$/)[1]
							.replace(/\n/g, "")
						)
					)
				);
				var publicKeyObject = API.FORGE.pki.rsa.setPublicKey(privateKeyObject.n, privateKeyObject.e);
				return API.Q.resolve(API.FORGE.pki.publicKeyToPem(publicKeyObject).replace(/\r\n/g, "\\n"));
			});
		},

		derivePublicOpenSSH: function () {
			var self = this;
			return API.Q.fcall(function () {
				// TODO: Cache this if private key path and value has not changed.
				var privateKey = API.FS.readFileSync(self.secret.keyPath, "utf8");
				var privateKeyObject = API.FORGE.pki.privateKeyFromAsn1(
					API.FORGE.asn1.fromDer(
						API.FORGE.util.decode64(
							privateKey
							.match(/^-----BEGIN RSA PRIVATE KEY-----\n([^-]+)\n-----END RSA PRIVATE KEY-----\n?$/)[1]
							.replace(/\n/g, "")
						)
					)
				);
				var publicKeyObject = API.FORGE.pki.rsa.setPublicKey(privateKeyObject.n, privateKeyObject.e);
				return API.Q.resolve(API.FORGE.ssh.publicKeyToOpenSSH(publicKeyObject));
			});
		},

		getSecretCode: function () {
			var self = this;
			return API.Q.reject(new Error("'getSecretCode' must be implemented by @impl!"));
		},

		getSecretCodeHash: function () {
			var self = this;
			return self.getSecretCode().then(function (secretCode) {
		        return API.CRYPTO.createHash("sha256").update(self.id + ":" + secretCode).digest();
	        });
		},

		encryptWithCode: function (decrypted) {
			var self = this;
			return self.getSecretCodeHash().then(function (secretCodeHash) {
				return API.Q.denodeify(API.CRYPTO.randomBytes)(32).then(function (buffer) {
		            var iv = API.CRYPTO.createHash("md5");
		            iv.update(self.id + ":" + buffer.toString("hex"));
		            iv = iv.digest();
		            var encrypt = API.CRYPTO.createCipheriv('aes-256-cbc', secretCodeHash, iv);
		            var encrypted = encrypt.update(decrypted, 'utf8', 'binary');
		            encrypted += encrypt.final('binary');
		            return iv.toString('hex') + ":" + new Buffer(encrypted, 'binary').toString('base64');
		        });
			});
		},

		decryptWithCode: function (encrypted) {
			var self = this;
			return self.getSecretCodeHash().then(function (secretCodeHash) {
	            encrypted = encrypted.split(":");
	            var decrypt = API.CRYPTO.createDecipheriv('aes-256-cbc', secretCodeHash, new Buffer(encrypted.shift(), 'hex'));
	            var decrypted = decrypt.update(new Buffer(encrypted.join(":"), 'base64').toString('binary'), 'binary', 'utf8');
	            decrypted += decrypt.final('utf8');
	            return decrypted;
	        });
		},

		makeInviteSecretsToken: function () {
			var self = this;
			// TODO: Move implementation to './api/origin/get-invite-token' and use here.
			return self.getSecretCodeHash().then(function (secretCodeHash) {

        		var store = API.EXTEND(true, {}, self.stores.primary);
        		delete store['@impl'];

				var code = (Math.floor(Math.random()*9000) + 1000);
				var token = API.JWT.sign(
					// TODO: Use storage implementation to also add ata here.
					{
						secretCodeHash: secretCodeHash.toString('base64'),
						store: store
					},
					// TODO: Use more than just the 'code' as secret.
					//       Also tie to authority.
					"invite:__StAbLe_RaNdOm__:" + code, {
						expiresInMinutes: 5
					}
				);

				return {
					token: "-" + new Buffer(token).toString("base64") + "-",
					code: "-" + code + "-"
				};
			});
		}
	}


	var Origin = function (config) {
		var self = this;

		self.$PLComponent = "space.pinf.genesis/origin/0";

		var privateConfig = {
			secret: config.secret
		}
		// TODO: Enable these once we have a secure serializer that
		//       can encrypt secret data into the object JSON and decrypt on unserialize.
		//delete config.secret;

		function privateAPI () {
			return Origin_PRIVATE.ready(self, privateConfig);
		}

		self.getPublicKeyPath = function () {
			return privateAPI().then(function (api) {
				return api.derivePublicKeyPath();
			});
		}
		self.getPublicPem = function () {
			return privateAPI().then(function (api) {
				return api.derivePublicPem();
			});
		}
		self.getPublicOpenSSH = function () {
			return privateAPI().then(function (api) {
				return api.derivePublicOpenSSH();
			});
		}
		self.encrypt = function (data) {
			return privateAPI().then(function (api) {
				return api.encryptWithCode(data);
			});
		}
		self.decrypt = function (data) {
			return privateAPI().then(function (api) {
				return api.decryptWithCode(data);
			});
		}
		self.getInviteSecretsToken = function () {
			return privateAPI().then(function (api) {
				return api.makeInviteSecretsToken();
			});
		}

		if (!self.public) self.public = {};

		self.ready = function () {

			return self.getPublicKeyPath().then(function (publicKeyPath) {

				self.public.keyPath = publicKeyPath;

				return self.getPublicPem().then(function (keyPem) {

					self.public.keyPem = keyPem;

					return self.getPublicOpenSSH().then(function (keyOpenSSH) {

						self.public.keyOpenSSH = keyOpenSSH;

						return null;
					});
				});
			}).then(function () {

				return self;
			});
		}
	}


	exports.PLComponent = function (config, groupConfig) {
		return API.EXTEND(true, new Origin(config), config).ready().then(function (origin) {
			return {
				// POLICY: Use '$' prefix to signify that config has been resolved.
				"$space.pinf.genesis/origin/0": origin
			};
		});
	}

});

