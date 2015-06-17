PINF.Space Genesis
==================

> The place from where it all originates.

Each information space needs a virtual point of origin to attach data to. This component provides such a point of origin along with a cryptographic model that protects the data.


Structures
----------

### space.pinf.genesis/origin/0

````
{
	"@impl": "io.pinf.pio.profile/origin/0",
	"uid": "{{env.PIO_PROFILE_KEY}}",
	"label": "{{$from.system.dirname}}",
	"secret": {
        "keyPath": "{{$from.system.privateKeyPath}}"
	},
	"stores": {
		"primary": {
			"@impl": "com.amazon.aws/s3/0",
            "region": "us-west-1",
            "publicHost": "s3-us-west-1.amazonaws.com",
            "path": "{{$from.system.dirname}}"
		}
	}
}
````

