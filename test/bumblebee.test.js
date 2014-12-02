'use strict';
var App    = require('../lib/bumblebee');
var assert = require('assert');

describe('bumblebee', function() {

  before(function() {
  });

  after(function() {
  });

  beforeEach(function() {
  });

  afterEach(function() {
  });

  it('Should be awesome', function(done) {
    var app = new App();
    var result = app.execute();
    assert.equal(result, 'awesome');
    done();
  });

});
