/*
 * bumblebee
 * https://github.com/danibram/bumblebee
 *
 * Copyright (c) 2014 Daniel Biedma Ramos
 * Licensed under the MIT license.
 */

'use strict';

var objCleaner = require('object-cleaner');
var async = require('async');
var utils = require('./utils');

var ObjectConstructor = function()
{
    var self =  this;

    self.forEveryKey = function (key, obj, fieldConfig, callback){
        //Output formatter
        var afterCb = function(value, callback){
            if (!value && fieldConfig.hasOwnProperty('__default')){
                value = fieldConfig.__default;
            }
            if(fieldConfig.__format){
                value = self.utils.parseType(value, fieldConfig.__format);
            }
            if(fieldConfig.__outputMod){
                value = fieldConfig.__outputMod(value);
            }
            return callback(null, value);
        };

        //Init

        //Set originField
        var value = null;
        if (fieldConfig.__originField){
            if (fieldConfig.__originField === 'root'){
                value = obj;
            } else {
                key = fieldConfig.__originField;
                value = utils.getValueOfNestedObjectByPath(obj, key);
            }
        } else {
            value = utils.getValueOfNestedObjectByPath(obj, key);
        }

        if (fieldConfig.__clean){
             obj = objCleaner(obj);
        }

        if (fieldConfig.__composer /*&& Object.prototype.toString.call(fieldConfig.composer) === "[object Object]"*/){
            // Composer must define a operation
            if (value){
                self.utils.composer[fieldConfig.__composer.__type](value, fieldConfig.__composer, afterCb, callback);
            } else {
                afterCb(null, callback);
            }
        } else if (fieldConfig.__scheema) {

            var kys = Object.keys(fieldConfig.__scheema);
            var nValue = {};
            async.eachSeries(
                kys,
                function(key2, nxt){
                    //console.log(fieldConfig)
                    var fConfig = fieldConfig.__scheema[key2];
                    self.forEveryKey(key2, obj, fConfig, function(err, res){
                        nValue[key2] = res;
                        nxt();
                    });
                },
                function(){
                    afterCb(nValue, callback);
                }
            );
        } else {
            afterCb(value, callback);
        }
    };

    self.utils = {
        composer:{
            RegEx: function(obj, creationConfig, afterCb, callback){
                var kys = Object.keys(obj);
                var array = [];
                for (var i = 0; i < kys.length; i++) {
                    var ky = kys[i];
                    if (ky.search(creationConfig.reg) > -1){
                        if (creationConfig.use && creationConfig.use === 'key'){
                            if (creationConfig.removeRegFromKey){
                                array.push(ky.replace(creationConfig.reg, ""));
                            } else {
                                array.push(ky);
                            }

                        } else if (creationConfig.use && creationConfig.use === 'value') {
                            array.push(obj[ky]);
                        }
                    }
                }
                afterCb(array, callback);
            },
            everyElement: function(array, config, afterCb, callback){
                var outputArray = [];
                async.eachSeries(
                    array,
                    function(ele, next){
                        if (config.__scheema){
                            var kys = Object.keys(config.__scheema);
                            var nObj = {};
                            async.eachSeries(
                                kys,
                                function(key, nxt){
                                    var fieldConfig = config.__scheema[key];
                                    self.forEveryKey(key, ele, fieldConfig, function(err, res){
                                        nObj[key] = res;
                                        nxt();
                                    });
                                },
                                function(){
                                    if (config.__condition){
                                        config.__condition(nObj, function(res){
                                            if (res){
                                                outputArray.push(nObj);
                                            }
                                            next();
                                        });
                                    } else {
                                        outputArray.push(nObj);
                                        next();
                                    }
                                }
                            );
                        } else {
                            var val;
                            if (config.__originField){
                                val = utils.getValueOfNestedObjectByPath(ele, config.__originField);
                            } else {
                                val = ele;
                            }

                            if(config.__outputMod){
                                val = config.__outputMod(val);
                            }

                            if (val) {
                                outputArray.push(val);
                            }
                            next();
                        }
                    },
                    function(){
                        afterCb(outputArray, callback);
                    }
                );
            },
            everyElementToObject: function(array, config, afterCb, callback){
                var outputObject = {};
                async.eachSeries(
                    array,
                    function(ele, next){
                        var key = utils.getValueOfNestedObjectByPath(ele, config.__key);
                        if (key === null){
                            next();
                        }
                        if (config.__scheema){
                            var kys = Object.keys(config.__scheema);
                            var nObj = {};
                            async.eachSeries(
                                kys,
                                function(key, nxt){
                                    var fieldConfig = config.__scheema[key];
                                    self.forEveryKey(key, ele, fieldConfig, function(err, res){
                                        nObj[key] = res;
                                        nxt();
                                    });
                                },
                                function(){
                                    if (config.__condition){
                                        config.__condition(nObj, function(res){
                                            if (res){
                                                outputObject[key] = nObj;
                                            }
                                            next();
                                        });
                                    } else {
                                        outputObject[key] = nObj;
                                        next();
                                    }
                                }
                            );
                        } else {
                            var val;
                            if (config.__originField){
                                val = utils.getValueOfNestedObjectByPath(ele, config.__originField);
                            } else {
                                val = ele;
                            }

                            if(config.__outputMod){
                                val = config.__outputMod(val);
                            }

                            if (val) {
                                outputObject[key] = val;
                            }
                            next();
                        }
                    },
                    function(){
                        afterCb(outputObject, callback);
                    }
                );
            }
        },
        parseType: function (value, type){
            switch(type) {
                case 'String':
                    if (value){
                        value = String(value);
                    }
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
                    value = utils.toBool(value);
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

    self.init = function (initialObject, referenceObject, model, cb){
        /*
            INIT
        */
        self.model = model;

        var nObj = {};
        if (initialObject){
            nObj = initialObject;
        }

        if (self.model){
            var arrKeys = Object.keys(self.model);

            async.eachSeries(
                arrKeys,
                function(key, next){
                    var fieldConfig = model[key];
                    //console.log('__Key: ' + key)
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
};

module.exports = ObjectConstructor;