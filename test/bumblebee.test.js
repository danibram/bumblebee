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
        ],
        imgGroups:{
            code: '1',
            images:
               [ { date: '02/11/2011',
                   source: 'files/public//0/5/6/3/Images/13202301045141.jpg',
                   uri: 'http://images.xtravelsystem.com/slide/files/public//0/5/6/3/Images/13202301045141.jpg' },
                 { date: '02/11/2011',
                   source: 'files/public//0/5/6/3/Images/13202301045952.jpg',
                   uri: 'http://images.xtravelsystem.com/slide/files/public//0/5/6/3/Images/13202301045952.jpg' },
                 { date: '02/11/2011',
                   source: 'files/public//0/5/6/3/Images/13202301046753.jpg',
                   uri: 'http://images.xtravelsystem.com/slide/files/public//0/5/6/3/Images/13202301046753.jpg' },
                 { date: '02/11/2011',
                   source: 'files/public//0/5/6/3/Images/13202301052654.jpg',
                   uri: 'http://images.xtravelsystem.com/slide/files/public//0/5/6/3/Images/13202301052654.jpg' },
                 { date: '02/11/2011',
                   source: 'files/public//0/5/6/3/Images/13202301053355.jpg',
                   uri: 'http://images.xtravelsystem.com/slide/files/public//0/5/6/3/Images/13202301053355.jpg' },
                 { date: '02/11/2011',
                   source: 'files/public//0/5/6/3/Images/13202301054156.jpg',
                   uri: 'http://images.xtravelsystem.com/slide/files/public//0/5/6/3/Images/13202301054156.jpg' } ]
        }
    };

    var model = {
        name: {format: 'String', originField: 'Name'},
        code: {format: 'Integer', originField: 'number'},
        active: {format: 'Boolean', originField: 'Active'},
        images: {
            format: 'Array',
            originField: 'root',
            composer:{
                type: 'RegEx',
                reg: 'image',
                use: 'value'
            }
        },
        latitud: {format: 'Float'},
        maybeValue: {format: 'Integer', default: 0},
        propertyCodes: {
            format: 'Array',
            originField: 'codes',
            composer:{
                type: 'everyElement',
                scheema:{
                    propertyOne: { originField:'cod1', format: 'Integer'},
                    propertyTwo: { originField:'cod2', format: 'Integer' }
                }
            }
        },
        samePropertyCodes:{
            originField: 'codes'
        },
        images2: {
            format: 'Array',
            originField: 'imgGroups.images',
            composer:{
                type: 'everyElement',
                originField: 'uri',
                format: 'String'
            }
        }
    };

    it('Should be awesome', function(done) {
        bumble({}, refObj, model, function(err, result){
            console.log(refObj);
            console.log(model);
            console.log(result);
            done(err, result);
        });
    });

});
