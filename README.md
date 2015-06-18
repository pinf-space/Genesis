PINF.Space Genesis
==================

> The place from where it all originates.

Each information space needs a virtual point of origin to attach data to. This component provides such a point of origin along with a cryptographic model that protects the data.


Model
-----

`<PINF.Space.URI> = <PINF.Space.Authority.ID> + <PINF.Space.ID>`

  * `<PINF.Space.URI>` is unique within the `<PINF.Space.Authority.ID>` space.
  * `<PINF.Space.ID>` is unique within the `<PINF.Space.Authority.ID>` space.
  * `<PINF.Space.Authority.ID>` is:
    * A *hostname* or *ip* for **public** web spaces
    * A *hash* or *other* for **internal** spaces


Structures
----------

### space.pinf.genesis/origin/0

````
{
	"@impl": "io.pinf.pio.profile/origin/0",
	"id": "{{env.PIO_PROFILE_KEY}}",
	"label": "{{$from.system.dirname}}",
	"secret": {
        "keyPath": "{{$from.system.privateKeyPath}}"
	},
	"stores": {
		"primary": {
			"@impl": "com.amazon.aws/s3/0"
		}
	}
}
````

### space.pinf.genesis/access/0

````
{
	"origin": "..."
}
````



