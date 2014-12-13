[![Coverage Status](https://coveralls.io/repos/danibram/bumblebee/badge.png?branch=master)](https://coveralls.io/r/danibram/bumblebee?branch=master) [![Dependency Status](https://david-dm.org/danibram/bumblebee.svg)](https://david-dm.org/danibram/bumblebee)

[![Bumblebee javascript object transformation tool](http://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Bumblebee_%288023382295%29.jpg/320px-Bumblebee_%288023382295%29.jpg)](https://github.com/danibram/bumblebee)

# bumblebee

Object transformation tool inspired on mongoose models. The basic idea is to contruct a result object, form a model and a reference object (and also you can pass an object as base).

## Getting Started
Install the module with: `npm install bumblebee`

```javascript
    var bumblebee = require('bumblebee-object-transformation');
    bumblebee(initialObject, referenceObject, model, function(err, result){
        console.log(result);
        //Your code....
    });
```

## Documentation
Basically you should use as model the final object, and field by field you can speficy:

-  ```__format``` : (to specify the default format)
-  ```__default``` : (if bumblebee dont find the field you can specify a default field)
-  ```__composer``` : (to make some operations predefined)
-  ```__scheema``` : (to compose the scheema of this field)
-  ```__originField```: (to specify the orifinal field inside the object, remeber that any scheema that you define inside the composer use their own element or subobject as reference)
-  ```__clean``` : (to use over the object selected my object cleaner, that removes innecesarry arrays with lenght 0, really usefull when you convert from xml to js.)

For now the operations are:
- RegEx : to find inside the object a fields and put in an array.
- everyElement : to loop over the elements of an array and make the transformations


Remember that this module is underconstruction, if you have some needs try to follow the essential structure of the application, and i try to merge all request. Usully i use this module, so im adapting frecuently.


## Examples
###_(From 0.3.0 Examples)_
```javascript
    initialObject = {};
    var referenceObject = {
        'title' : 'title',
        'text': 'hey im a text',
        'position' : [ 41.3901566, 2.1355214 ],
        'you' : {
            'video' : {
                'active': true,
                'times': 4,
                'information':{
                    'duration': 10,
                    'format': 'min'
                }
            }
        },
        'youtube':{
            'expiration': 'DATE',
            'expirationTimezone': 'GMT+1'
        },
        'buyNowConfig': {
            'price': 100
        },
        'product':{
            'images':[
                { url: 'http://lkjljklkj/123'},
                { url: 'http://lkjljklkj/456'},
                { url: 'http://lkjljklkj/678'},
                { url: 'http://lkjljklkj/999'},
            ]
        }
    };
    var model = {
        'position': {
            __format: 'Object',
            __scheema: {
                lat: { __format: 'Float', __originField: 'position.0' },
                lng: { __format: 'Float', __originField: 'position.1' }
            }
        },
        'youtube': {
            __scheema:{
                'active': { __format: 'Boolean', __originField: 'you.video.active'},
                'times': { __format: 'Integer', __originField: 'you.video.times'},
                'duration': { __format: 'Integer', __originField: 'you.video.information.duration'},
                'expiration': { __format: 'String', __originField: 'youtube.expiration'},
                'expirationTimezone': { __format: 'String', __originField: 'youtube.expirationTimezone'},
            }
        },
        'products': {
            __format: 'Array',
            __scheema: {
                'title': { __format: 'Object' },
                'text': { __format: 'Object' },
                'imagePath': { __format: 'String', __originField: 'images.0.url', __outputMod: function (url) { return url+ ".jpg" } },
                'buyNowPrice': { __format: 'Float', __originField: 'buyNowConfig.price' }
            }
        },
        'images' : {
            __format: 'Array',
            __originField: 'product.images',
            __composer:{
                __type: 'everyElement',
                __scheema: {
                    'type': { __format: 'String', __default: 'internal' },
                    'fullUrl': { __format: 'String', __originField: 'url', __outputMod: function (url) { return url+ ".jpg" } }
                }
            }
        },
    };
```
  Passing this 2 objects the module reconstruct this in the output:
```javascript

result = {
    position: {
        lat: 41.3901566,
        lng: 2.1355214
    },
    youtube : {
        active: true,
        times: 4,
        duration: 10,
        expiration: 'DATE',
        expirationTimezone: 'GMT+1'
    },
    products: [
        {
        title: 'title',
        text: 'hey im a text',
        imagePath: 'http://lkjljklkj/123.jpg',
        buyNowPrice: 100
        }
    ],
    images: [
        { type: 'internal', fullUrl: 'http://lkjljklkj/123.jpg' },
        { type: 'internal', fullUrl: 'http://lkjljklkj/456.jpg' },
        { type: 'internal', fullUrl: 'http://lkjljklkj/678.jpg' },
        { type: 'internal', fullUrl: 'http://lkjljklkj/999.jpg' }
    ]
}

```
###_(From 0.2.1 Examples)_
```javascript
    initialObject = {
        _id: "000001"
    };
    referenceObject = {
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
    model = {
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
  result = {
    _id: "000001",
      name: 'dummy',
      code: 1243,
      active: true,
      images: [
        'http://urltoimage1',
        'http://urltoimage2',
        'http://urltoimage3',
        'http://urltoimage4'
     ],
      latitud: 12.43,
      maybeValue: 0,
      propertyCodes:[
        { providerCode: '111', providerType: '11' },
        { providerCode: '333', providerType: '11' },
        { providerCode: '444', providerType: '22' },
        { providerCode: '555', providerType: '22' }
    ]
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

####(0.3.0 Lastest)
Models:
- (0.3.0) _(From 0.2.1 to 0.3)_ Not more type to define the output format, simply format.
- (0.3.0) _(From 0.2.1 to 0.3)_ All internal operators are rewrite with "__" to remove comflicts

Operations:
- (0.3.0) Now added the scheema operation that allows you to compose objects.

## License
Copyright (c) 2014 Daniel Biedma Ramos
Licensed under the MIT license.
