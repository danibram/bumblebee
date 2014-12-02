/*
 * bumblebee
 * https://github.com/dani/bumblebee
 *
 * Copyright (c) 2014 Daniel Biedma Ramos
 * Licensed under the MIT license.
 */

'use strict';

var App = function() {
  var execute = function() {
    return 'awesome';
  };

  return Object.freeze({
    execute: execute
  });
};

module.exports = App;

var async = require('async');
var util = require('util');
var apiUtils = require('./apiUtils');

var ObjectConstructor = function(initialObj, obj, modelName, cb)
{
    var self =  this;
    self.models = {
        hotusaHotel: {
            nombre_h: {type: 'String'},
            direccion: {type: 'String'},
            poblacion:  {type: 'String'},
            latitud: {type: 'Float'},
            longitud: {type: 'Float'},
            desc_hotel:  {type: 'String'},
            services:  {type: 'Array'},
            roomServices:  {type: 'Array'},
            checkin: {type: 'String'},
            checkout: {type: 'String'},
            cp: {type: 'String'},
            country: {type: 'String'},
            mail: {type: 'String'},
            web: {type: 'String'},
            telefono: {type: 'String'},
            city_tax: {type: 'String'},
            num_habitaciones: {type: 'Integer', default: 0},
            tipo_establecimiento: {type: 'Integer', default: 0},
            como_llegar: {type: 'Integer', default: 0},
            categoria: {type: 'String'},
            currency: {type: 'String'},
            fotos: {type: 'Array'}
        },
        jumboHotel: {
            id: {type: 'String'},
            buildingId: {type: 'String'},
            deprecated: {type: 'Boolean'},
            address: {type: 'Object', originField: 'Address'},
            name: {type: 'String'},
            categoryCode: {type: 'String'},
            categoryName: {type: 'String'},
            shortDescription: {type: 'String'},
            longDescription: {type: 'String'},
            latitude:{type: 'Float'},
            longitude: {type: 'Float'},
            typeCode: {type: 'String'},
            typeName: {type: 'String'},
            property: {type: 'Array', originField: {type: 'RegEx', reg: 'Property_', use: 'key'}},
            image: {type: 'Array', originField:{type: 'RegEx', reg: 'Image_', use: 'value'}},
            comments:  {type: 'Array'}
        },
        giataId:{
            giataId: {type: 'String', originField: '$.giataId'},
            lastUpdate: {type: 'String', originField: '$.lastUpdate'},
            name: {type: 'String'},
            city: {type: 'String', originField: 'city._'},
            cityId: {type: 'String', originField: 'city.$.cityId'},
            country: {type:'String'},
            address: {type: 'Object', originField: 'adresses'},
            phones: {type: 'Array'},
            emails: {type: 'Array'},
            latitude: {type: 'Float', originField: 'geoCodes.latitude'},
            longitude: {type: 'Float', originField: 'geoCodes.longitude'},
            propertyCodes: {
                type: 'Array',
                originField:{
                    type: 'everyElement',
                    scheema: {
                        providerCode: {type: 'String', originField: '$.providerCode'},
                        providerType: {type: 'String', originField: '$.providerType'},
                        code: {type: 'Array'}
                    }
                }
            },
            ghgml: {type: 'Object'}
        }
    };

    self.forEveryKey = function (key, obj, fieldConfig, callback){
        var afterCb = function(value, callback){
            value = self.utils.parseType(value,fieldConfig.type);
            callback(null, value);
        };


        if (Object.prototype.toString.call(fieldConfig.originField) === "[object Object]"){
            if (obj[key]){
                self.utils.creation[fieldConfig.originField.type](obj, key, fieldConfig.originField, afterCb, callback);
            } else {
                afterCb(null, callback);
            }
        } else {
            var path = key;
            if (fieldConfig.originField){
                path = fieldConfig.originField;
            }
            self.utils.creation.byPath(obj, path, afterCb, callback);
        }
    };

    self.utils = {
        cleanObj: apiUtils.cleanObjXml,
        creation:{
            RegEx: function(obj, key, creationConfig, afterCb, callback){
                var kys = Object.keys(obj);
                var array = [];
                for (var i = 0; i < kys.length; i++) {
                    var ky = kys[i];
                    if (ky.search(creationConfig.reg) > -1){
                        if (creationConfig.use && creationConfig.use === 'key'){
                            array.push(ky.replace(creationConfig.reg, ""));
                        } else {
                            array.push(obj[ky]);
                        }
                    }
                }
                afterCb(array, callback);
            },
            byPath: function(obj, creationConfig, afterCb, callback){
                var value = apiUtils.getValueOfNestedObjectByPath(obj, creationConfig);
                afterCb(value, callback);
            },
            everyElement: function (obj, key, creationConfig, afterCb, callback){
                var temp = obj[key];

                var kys = Object.keys(creationConfig.scheema);
                var array = [];

                async.eachSeries(
                    temp,
                    function(ele, next){

                        var nObj = {};
                        async.eachSeries(
                            kys,
                            function(key, nxt){
                                var fieldConfig = creationConfig.scheema[key];
                                self.forEveryKey(key, ele, fieldConfig, function(err, res){
                                    nObj[key] = res;
                                    nxt();
                                });
                            },
                            function(){
                                array.push(nObj);
                                next();
                            }
                        );
                    },
                    function(){
                        afterCb(array, callback);
                    }
                );
            },
            composeArray: function(obj, key, creationConfig, afterCb, callback){
                var array = [];
                async.eachSeries(
                    creationConfig.scheema,
                    function(ele, next){
                        var kys = Object.keys(ele);
                        array.push(self.utils.parseType(obj[kys[0]], ele[kys[0]].type));
                        next();
                    },
                    function(){
                        afterCb(array, callback);
                    }
                );
            }
        },
        parseType: function (value, type){
            switch(type) {
                case 'String':
                    value = String(value);
                    break;
                case 'Integer':
                    value = parseInt(value);
                    if (isNaN(value)) {
                        value = null;
                    }
                    break;
                case 'Float':
                    value = parseFloat(value);
                    if (isNaN(value)) {
                        value = null;
                    }
                    break;
                case 'Boolean':
                    value = apiUtils.toBool(value);
                    break;
                case 'Array':
                    if (!Array.isArray(value)){
                        if (value){
                            value = [value];
                        } else {
                            value = [];
                        }

                    }
                    break;
                default:
                    break;
            }
            return value;
        }
    };

    /*
        INIT
    */

    obj = self.utils.cleanObj(obj);

    var nObj = {};
    if (initialObj){
        nObj = initialObj;
    }
    if (modelName){
        var model = self.models[modelName];
        var arrKeys = Object.keys(model);

        async.eachSeries(
            arrKeys,
            function(key, next){
                var fieldConfig = model[key];

                self.forEveryKey(key, obj, fieldConfig, function(err, res){
                    nObj[key] = res;
                    next();
                });
            },
            function(err, r){
                return cb(null, nObj);
            }
        );
    } else {
        return cb(null, obj);
    }
};

module.exports = ObjectConstructor;