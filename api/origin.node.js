
const DEV = false;


exports.forLib = function (LIB) {
    var ccjson = this;


    return LIB.Promise.resolve({
        forConfig: function (defaultConfig) {

            var Entity = function (instanceConfig) {
                var self = this;

                var config = {};
                LIB._.merge(config, defaultConfig);
                LIB._.merge(config, instanceConfig);
                config = ccjson.attachDetachedFunctions(config);

                var PGL_LOADER = require('org.pinf.genesis.lib/pgl-loader');

                function ensure () {
                    if (!ensure._promise) {
                        ensure._promise = PGL_LOADER.loadModule(
                            require.resolve("./origin"),
                            config
                        ).then(function (origin) {
                            return origin;
                        });
                    }
                    return ensure._promise;
                }

                self.getAt = function (selector) {
                    return ensure().then(function (origin) {

                        origin = origin['$space.pinf.genesis/origin/0'];

                        // TODO: Store finalized config object as runtime object
                        //       for easy introspection by tooling.
                        var rt = LIB._.merge({}, config, {
                            "public": {
                                "keyPath": origin.public.keyPath,
                                "keyPem": origin.public.keyPem,
                                "keyOpenSSH": origin.public.keyOpenSSH
                            },
                            "private": {
                                "keyPath": origin.secret.keyPath
                            }
                        });

                        return LIB.traverse(rt).get(selector);
                    });
                }

                self.AspectInstance = function (aspectConfig) {

                    var config = {};
                    LIB._.merge(config, defaultConfig);
                    LIB._.merge(config, instanceConfig);
                    LIB._.merge(config, aspectConfig);
                    config = ccjson.attachDetachedFunctions(config);

console.log("init PINF space profile aspect!", config);

                    // TODO: Pass 'config' to 'ensure' and split ensure into instance and aspect
                    //       layers to allow per-aspect ensure with custom config.
                    return ensure().then(function (origin) {

console.log("!!!!!!origin", origin);


                        return LIB.Promise.resolve({
                            pio: function () {
                                return LIB.Promise.resolve(
                                    ccjson.makeDetachedFunction(function (args) {
    
                                        var exports = {};


                                        return exports;
                                    })
                                );
                            }
                        });
                    });
                }
            }

            return Entity;
        }
    });
}
