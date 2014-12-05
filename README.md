# bumblebee   [![](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Bumblebee_%288023382295%29.jpg/320px-Bumblebee_%288023382295%29.jpg =150x100)](http://travis-ci.org/danibram/bumblebee) 
 [![Build Status](https://secure.travis-ci.org/danibram/bumblebee.png?branch=master)](http://travis-ci.org/danibram/bumblebee) [![Coverage Status](https://coveralls.io/repos/danibram/bumblebee/badge.png?branch=master)](https://coveralls.io/r/danibram/bumblebee?branch=master) [![Dependency Status](https://david-dm.org/danibram/bumblebee.svg)](https://david-dm.org/danibram/bumblebee)

Object transformation tool inspired on mongoose models.

## Getting Started
Install the module with: `npm install bumblebee`

```javascript
var bumblebee = new require('bumblebee');
bumblebee.execute(); // "awesome"
```

## Documentation
_(Coming soon)_

## Examples
```javascript
var refObj = {
        Name: 'dummy',
        number: '1243',
        latitud: '12.43',
        Active: 'true',
        image1: 'http://urltoimage1',
        image2: 'http://urltoimage2',
        image3: 'http://urltoimage3',
        image4: 'http://urltoimage4',
        codes:[
            {cod1: '111', cod2:'11'},
            {cod1: '333', cod2:'11'},
            {cod1: '444', cod2:'22'},
            {cod1: '555', cod2:'22'}
        ]
    };

    var model = {
        name: {type: 'String', originField: 'Name'},
        code: {type: 'Integer', originField: 'number'},
        active: {type: 'Boolean', originField: 'Active'},
        images: {type: 'Array', composer:{type: 'RegEx', reg: 'image', use: 'value'}},
        latitud: {type: 'Float'},
        maybeValue: {type: 'Integer', default: 0},
        propertyCodes: {
            type: 'Array',
            originField: 'codes',
            composer:{
                type: 'everyElement',
                scheema: {
                    providerCode: {type: 'String', originField: 'cod1'},
                    providerType: {type: 'String', originField: 'cod2'}
                }
            }
        }
    };
  ```
  
  Passing this 2 objects the module reconstruct this in the output:
  
  ```javascript
  { name: 'dummy',
  code: 1243,
  active: true,
  images:
   [ 'http://urltoimage1',
     'http://urltoimage2',
     'http://urltoimage3',
     'http://urltoimage4' ],
  latitud: 12.43,
  maybeValue: 0,
  propertyCodes:
   [ { providerCode: '111', providerType: '11' },
     { providerCode: '333', providerType: '11' },
     { providerCode: '444', providerType: '22' },
     { providerCode: '555', providerType: '22' } ] }
  ```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Daniel Biedma Ramos
Licensed under the MIT license.
