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
        var afterCb = function(value, callback){
            if (!value){
                value = fieldConfig.default;
            }
            value = self.utils.parseType(value, fieldConfig.type);
            callback(null, value);
        };

        //console.log(Object.prototype.toString.call(fieldConfig.originField));
        if (fieldConfig.originField){
            key = fieldConfig.originField;
        }

        if (fieldConfig.composer && Object.prototype.toString.call(fieldConfig.composer) === "[object Object]"){
            if (obj[key] || fieldConfig.composer.type === 'RegEx' ){
                self.utils.composer[fieldConfig.composer.type](obj, key, fieldConfig.composer, afterCb, callback);
            } else {
                afterCb(null, callback);
            }
        } else {
            var path = key;
            if (fieldConfig.originField){
                path = fieldConfig.originField;
            }
            self.utils.composer.byPath(obj, path, afterCb, callback);
        }
    };

    self.utils = {
        composer:{
            RegEx: function(obj, key, creationConfig, afterCb, callback){
                console.log('here')
                var kys = Object.keys(obj);
                var array = [];
                for (var i = 0; i < kys.length; i++) {
                    var ky = kys[i];
                    if (ky.search(creationConfig.reg) > -1){
                        if (creationConfig.use && creationConfig.use === 'key'){
                            array.push(ky.replace(creationConfig.reg, ""));
                        } else if (creationConfig.use && creationConfig.use === 'value') {
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
                    console.log('__Key: ' + key)
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