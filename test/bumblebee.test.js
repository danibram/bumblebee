'use strict';
var bumble = require('../lib/bumblebee');
var expect = require('chai').expect;

describe('bumblebee', function() {

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
                'imagePath': { __format: 'String', __originField: 'product.images.0.url', __outputMod: function (url) { return url+ ".jpg" } },
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

    it('Should be awesome', function(done) {
        bumble({}, referenceObject, model, function(err, result){
            console.log(result);
            done(err, result);
        });
    });

});
