/*
 * bumblebee
 * https://github.com/danibram/bumblebee
 *
 * Copyright (c) 2014 Daniel Biedma Ramos
 * Licensed under the MIT license.
 */

'use strict';

var bumblebee = require('./core');

var loader = function(initialObject, referenceObject, model, cb)
{
    return bumblebee(initialObject, referenceObject, model, cb).bind(this);
};

module.exports = loader;