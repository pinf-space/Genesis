

require('org.pinf.genesis.lib/lib/api').forModule(require, module, function (API, exports) {


    function getSecrets () {

	    return API.Q.denodeify(function (callback) {

	        console.log("Please enter your credentials:");

	        return API.INQUIRER.prompt([
		        {
		        	name: "token",
	                type: "password",
	                message: "Token"
		        },
		        {
		        	name: "code",
	                type: "password",
	                message: "Token Unlock Code"
		        }
	        ], function(answers) {
	            return callback(null, answers);
	        });
	    })();
    }


    return getSecrets().then(function (secrets) {

console.log("SEED VARS", secrets);

		var token = new Buffer(secrets.token.replace(/(^-|-$)/g, ""), "base64").toString();

console.log("TOKEN", token, "END");

		try {
			secrets = API.JWT.verify(
				token,
				"invite:__StAbLe_RaNdOm__:" + secrets.code
			);
		} catch (err) {
			console.error("ERROR: Could not unlock token using code due to: " + err.message);
			return;
		}


console.log("secrets", secrets);

//var repositoryUri = (process.env.PIO_PROFILE_ENDPOINT || packageDescriptor.config.pio.profileRegistryUri) + "/" + process.env.PIO_PROFILE_KEY;
//process.env.PIO_PROFILE_KEY + ":" + process.env.PIO_PROFILE_SECRET

//{ token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRDb2RlSGFzaCI6ImZnckhIMGZiN3FRVGNjNHZxRVQ2SCtnYTdSbmN5NlpJTlJldkRaVG55clE9Iiwic3RvcmUiOnsiczMiOnsicmVnaW9uIjoidXMtd2VzdC0xIiwicHVibGljSG9zdCI6InMzLXVzLXdlc3QtMS5hbWF6b25hd3MuY29tIiwicGF0aCI6ImNvcmUub3Blbi5nZW5lc2lzLmdpbnNlbmcuaW9-QjhGQjg4QjUtNDk1OC00NkRDLTgyRkQtOTQzNTMxMjgwMEEwIiwiYnVja2V0IjoicHJvZmlsZS5waW8ucGluZi5pbyJ9LCJpYW1Vc2VyTmFtZSI6InBpbmYubWUiLCJhY2Nlc3NLZXlJZCI6IkFLSUFKNlZBQjVTUVFOQzZFWlNRIiwic2VjcmV0QWNjZXNzS2V5IjoiZUZjcnVla3dZSUxvQlhZRno5YUxER2dJQ05NQUloRUlFcUdrWThCeSJ9LCJpYXQiOjE0MzQ3MTA1MDQsImV4cCI6MTQzNDcxMDgwNH0.8HYDWQeybEre0E0b0cna-0R07TQwlpRPs1u6mkdxOVU',
  //code: '6842'

    });


});

/*

const PATH = require("path");
const CRYPTO = require("crypto");
const COLORS = require("colors");
const FS = require("fs-extra");
const UUID = require("uuid");
const SMI = require("smi.cli");
const DEEPMERGE = require("deepmerge");
const WAITFOR = require("waitfor");
const REQUEST = require("request");


// TODO: Instead of implementing all this code here we should be calling the 'pio.profile' service with a specific context.


COLORS.setTheme({
    error: 'red'
});

var packageRootPath = process.cwd();
var packageDescriptorFilePath = PATH.join(packageRootPath, "package.json");
var activationFilePath = PATH.join(packageRootPath + ".activate.sh");
var profileFilePath = PATH.join(packageRootPath + ".profile.json");
var sshKeyBasePath = PATH.join((process.env.HOME || "/home/ubuntu"), ".ssh");


exports.provision = function (callback) {

    var files = [
        {
            name: "profile.json",
            path: profileFilePath
        },
        {
            name: "activate.sh",
            path: activationFilePath
        },
        {
            name: "ssh.key",
            path: null
        }
    ];

    console.log("[pio-provision-profile] See if we can download profile files from online ...");

    if (!process.env.PIO_PROFILE_KEY) {
        return callback("[pio-provision-profile] Cannot download profile files from online because 'PIO_PROFILE_KEY' environment variable is not set!");
    }
    if (!process.env.PIO_PROFILE_SECRET) {
        return callback("[pio-provision-profile] Cannot download profile files from online because 'PIO_PROFILE_SECRET' environment variable is not set!");
    }

    return SMI.readDescriptor(packageDescriptorFilePath, {
        basePath: packageRootPath,
        resolve: true,
        ignoreMissingExtends: true
    }, function(err, packageDescriptor) {
        if (err) return callback(err);

        var repositoryUri = (process.env.PIO_PROFILE_ENDPOINT || packageDescriptor.config.pio.profileRegistryUri) + "/" + process.env.PIO_PROFILE_KEY;

        function downloadFile(fileinfo, callback) {

            var url = repositoryUri + "/" + fileinfo.name;

            function getFilePath (callback) {   
                var file = fileinfo.path;
                if (fileinfo.name === "ssh.key") {
                    file = PATH.join(sshKeyBasePath, process.env.PIO_PROFILE_KEY);
                }
                return callback(null, file);
            }

            return getFilePath(function (err, file) {
                if (err) return callback(err);

                if (FS.existsSync(file)) {

                    console.log("[pio-provision-profile] Skip download of '" + url + "' as '" + file + "' already exists");

                    return callback(null);
                } else {

                    console.log("[pio-provision-profile] Trying to download '" + url + "' to '" + file + "'");

                    return REQUEST(url, function(err, response, body) {
                        if (err) {
                            return callback(err);
                        }
                        if (response.statusCode !== 200) {
                            console.log("response.headers", response.headers);
                            console.log("body", body);
                            return callback("[pio-provision-profile] No profile file found online! Go status code: " + response.statusCode);
                        }
                        var secretHash = CRYPTO.createHash("sha256");
                        secretHash.update(process.env.PIO_PROFILE_KEY + ":" + process.env.PIO_PROFILE_SECRET);
                        secretHash = secretHash.digest();
                        body = body.split(":");
                        var decrypt = CRYPTO.createDecipheriv('aes-256-cbc', secretHash, new Buffer(body.shift(), 'hex'));
                        var decrypted = decrypt.update(new Buffer(body.join(":"), 'base64').toString('binary'), 'binary', 'utf8');
                        decrypted += decrypt.final('utf8');

                        var cachePath = PATH.join(packageRootPath, ".pio.cache/pio.profile", fileinfo.name + "~mtime");

                        FS.outputFileSync(file, decrypted);
                        FS.outputFileSync(cachePath, Math.ceil(FS.statSync(file).mtime.getTime()/1000));

                        console.log("[pio-provision-profile] Wrote file to: " + file);

                        if (fileinfo.name === "ssh.key") {
                            FS.chmodSync(file, 0600);
                        }

                        return callback(null);
                    });
                }
            });
        }

        var waitfor = WAITFOR.serial(function(err) {
            if (err) return callback(err);
            console.log(("[pio-provision-profile] Profile downloaded! Run 'source bin/activate.sh' next!").magenta);
            return callback(null);
        });
        files.forEach(function (fileinfo) {
            return waitfor(fileinfo, downloadFile);
        });
        return waitfor();
    });
}


if (require.main === module) {
    exports.provision(function(err) {
        if (err) {
            if (typeof err === "string") {
                console.error((""+err).red);
            } else
            if (typeof err === "object" && err.stack) {
                console.error((""+err.stack).red);
            }
            process.exit(1);
        }
        process.exit(0);
    });
}

*/