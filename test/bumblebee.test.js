'use strict';
var bumble = require('../lib/bumblebee');
var expect = require('chai').expect;

describe('bumblebee', function() {

    var refObj = {
        name: 'dummy',
        number: '1243',
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
        code: {type: 'Integer', number: 'name'},
        images: {type: 'Array', originField:{type: 'RegEx', reg: 'image', use: 'value'}},
        latitud: {type: 'Float'},
        poblacion:  {type: 'String'},
        maybeValue: {type: 'Integer', default: 0},
        propertyCodes: {
            type: 'Array',
            originField:{
                type: 'everyElement',
                scheema: {
                    providerCode: {type: 'String', originField: 'cod1'},
                    providerType: {type: 'String', originField: 'cod2'},
                    code: {type: 'Array'}
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
