'use strict';
var bumble = require('../lib/bumblebee');
var expect = require('chai').expect;

describe('bumblebee', function() {

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

    it('Should be awesome', function(done) {
        bumble({}, refObj, model, function(err, result){
            console.log(result);
            done(err, result);
        });
    });

});
