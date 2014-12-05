/*
 * bumblebee
 * https://github.com/danibram/bumblebee
 *
 * Copyright (c) 2014 Daniel Biedma Ramos
 * Licensed under the MIT license.
 */

'use strict';

var T = require('./core');

var loader = function(initialObject, referenceObject, model, cb)
{
    var bumble = new T();
    return bumble.init(initialObject, referenceObject, model, cb);
};

module.exports = loader;