'use strict';

var expect = require('expect.js');

// Test bosco-service.json file is in root due to process.cwd usage.

describe('Aggregate version header from bosco-service.json and environment', function () {

    it('should read headers from a bosco-service.json file', function (done) {
      var bv = require('..')('102','tes');
      expect(bv.headers).to.contain('cx-bundle|js-top');
      expect(bv.headers).to.contain('cx-bundle|css-bottom');
      expect(bv.headers).to.contain('cx-bundle|files-top');
      done();
    });

    it('should parse a x-cdn-url and append the build version', function (done) {
      var bv = require('..')('102','tes');
      var app = {
        config: {},
        set: function(key, value) {
          this.config[key] = value;
        }
      };
      var req = {
        headers:{
          'x-cdn-url':'http://cdn.base.url/'
        },
        app:app
      };
      var res = {
        setHeader: function() {}
      };
      bv.middleware(req, res, function() {
        expect(app.config.cdnUrl).to.be('http://cdn.base.url/tes/102/');
        done();
      });

    });

    it('should use sensible defaults', function (done) {
      var bv = require('..')();
      var app = {
        config: {},
        set: function(key, value) {
          this.config[key] = value;
        }
      };
      var req = {
        headers:{
          'x-cdn-url':'http://cdn.base.url/'
        },
        app:app
      };
      var res = {
        setHeader: function() {}
      };
      bv.middleware(req, res, function() {
        expect(app.config.cdnUrl).to.be('http://cdn.base.url/assets/default/');
        done();
      });

    });

});
