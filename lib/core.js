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
var async = require('async');
var utils = require('./utils');

var ObjectConstructor = function(initialObject, referenceObject, model, cb)
{
    var self =  this;

    self.forEveryKey = function (key, obj, fieldConfig, callback){
        //Output formatter
        var afterCb = function(value, callback){
            if (!value){
                value = fieldConfig.default;
            }
            value = self.utils.parseType(value, fieldConfig.type);
            callback(null, value);
        };

        //Init

        //Set originField
        var value = null;
        if (fieldConfig.originField){
            if (fieldConfig.originField === 'root'){
                value = obj;
            } else {
                key = fieldConfig.originField;
                value = utils.getValueOfNestedObjectByPath(obj, key);
            }
        } else {
            value = utils.getValueOfNestedObjectByPath(obj, key);
        }


        if (fieldConfig.composer /*&& Object.prototype.toString.call(fieldConfig.composer) === "[object Object]"*/){
            // Composer must define a operation
            if (value){
                self.utils.composer[fieldConfig.composer.type](value, fieldConfig.composer, afterCb, callback);
            } else {
                afterCb(null, callback);
            }
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
                        if (config.scheema){
                            var kys = Object.keys(config.scheema);
                            var nObj = {};
                            async.eachSeries(
                                kys,
                                function(key, nxt){
                                    var fieldConfig = config.scheema[key];
                                    self.forEveryKey(key, ele, fieldConfig, function(err, res){
                                        nObj[key] = res;
                                        nxt();
                                    });
                                },
                                function(){
                                    outputArray.push(nObj);
                                    next();
                                }
                            );
                        } else {
                            var val = utils.getValueOfNestedObjectByPath(ele, config.originField);
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

        referenceObject = objCleaner(referenceObject);

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