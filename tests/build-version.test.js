'use strict';

var expect = require('expect.js');

// Test bosco-service.json file is in root due to process.cwd usage.

describe('Aggregate version header from bosco-service.json and environment', function () {

    it('should read headers from a bosco-service.json file', function (done) {
      var bv = require('..')('102');
      expect(bv.headers).to.contain('cx-bundle|js-top');
      expect(bv.headers).to.contain('cx-bundle|css-bottom');
      expect(bv.headers).to.contain('cx-bundle|files-top');
      done();
    });

});
