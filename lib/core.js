/*
 * bumblebee
 * https://github.com/danibram/bumblebee
 *
 * Copyright (c) 2014 Daniel Biedma Ramos
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');
var objCleaner = require('object-cleaner');
var utils = require('../utils');

var ObjectConstructor = function(initialObject, referenceObject, model, cb)
{
    var self =  this;
    self.model = model;

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
        cleanObj: objCleaner,
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
                var value = utils.getValueOfNestedObjectByPath(obj, creationConfig);
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
    referenceObject = self.utils.cleanObj(referenceObject);

    var nObj = {};
    if (initialObject){
        nObj = initialObject;
    }

    if (model){
        var arrKeys = Object.keys(model);

        async.eachSeries(
            arrKeys,
            function(key, next){
                var fieldConfig = model[key];

                self.forEveryKey(key, referenceObject, fieldConfig, function(err, res){
                    nObj[key] = res;
                    next();
                });
            },
            function(err, r){
                return cb(null, nObj);
            }
        );
    } else {
        return cb(null, referenceObject);
    }
};

module.exports = ObjectConstructor;