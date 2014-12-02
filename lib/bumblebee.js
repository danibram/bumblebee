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
