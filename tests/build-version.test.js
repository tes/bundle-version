'use strict';

var expect = require('expect.js');

// Test bosco-service.json file is in root due to process.cwd usage.

describe('Aggregate version header from bosco-service.json and environment', function () {

    it('should read headers from a bosco-service.json file', function (done) {
      var bv = require('..');
      expect(bv.headers).to.contain('cx-static|js-top');
      expect(bv.headers).to.contain('cx-static|css-bottom');
      expect(bv.headers).to.contain('cx-static|files-top');
      done();
    });

});
