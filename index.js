'use strict';

var cwd = process.cwd();
var fs = require('fs');
var path = require('path');
var url = require('url');
var _ = require('lodash');
var packageJson = require('./package.json')

function getHeaders() {
    var boscoServiceFile = path.join(cwd,'bosco-service.json');
    if(fs.existsSync(boscoServiceFile)) {
        var boscoService = require(boscoServiceFile), bundles = [];
        if(boscoService.assets) {
            bundles.push(_.keys(boscoService.assets.js));
            bundles.push(_.keys(boscoService.assets.css));
        }
        if(boscoService.files) {
            bundles.push(_.keys(boscoService.files));
        }
        bundles = _.map(_.flatten(bundles), function(bundle) {
            return 'cx-bundle|' + bundle;
        });
        return bundles;
    } else {
        return [];
    }
}
var headers = getHeaders();

module.exports = function(buildNumber, assetBase) {

    if (buildNumber === undefined) {
        var manifestPath = path.join(cwd, 'manifest.json')
        var manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath)) : {};
        buildNumber = manifest.build || 'default';
    }
    assetBase = assetBase || 'assets';

    /*
     Craft a cdnUrl based on the bosco asset pipeline.
    */
    var createCdnUrl = function(request) {
        var baseCdnUrl = request.headers['x-cdn-url'] || '';
        return url.resolve(baseCdnUrl, assetBase + '/' + buildNumber + '/');
    }

    var hapiPlugin = function (plugin, options, next) {
        plugin.ext('onPostHandler', function(request, next) {
            if(!buildNumber) { return next(); }
            if(!request.response.headers) { return next() } // lab tests dont set this by default
            _.forEach(headers, function(header) {
                request.response.headers[header] = buildNumber
            });
            request.pre.cdnUrl = createCdnUrl(request);
            next();
        })
        next()
    }
    hapiPlugin.attributes = _.pick(packageJson, 'name', 'version');

    var middleware = function(req, res, next) {
        if(!buildNumber) { return next(); }
        _.forEach(headers, function(header) {
            res.setHeader(header, buildNumber);
        });
        req.app.set('cdnUrl', createCdnUrl(req));
        next();
    }

    return {
        middleware: middleware,
        register: hapiPlugin,
        headers: headers,
        buildNumber: buildNumber
    };
};

