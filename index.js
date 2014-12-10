'use strict';

var cwd = process.cwd();
var fs = require('fs');
var path = require('path');
var url = require('url');
var _ = require('lodash');
var packageJson = require('./package.json');

/**
 * Extract all the data from the bosco-service file
 */
var boscoServiceFile = path.join(cwd,'bosco-service.json'),
    boscoData = {headers:[], name: packageJson.name || 'unknown'};

if(fs.existsSync(boscoServiceFile)) {
    var boscoService = require(boscoServiceFile);
    if(boscoService.service && boscoService.service.name) {
        boscoData.name = boscoService.service.name;
    }
    if(boscoService.assets) {
        boscoData.headers.push(_.keys(boscoService.assets.js));
        boscoData.headers.push(_.keys(boscoService.assets.css));
    }
    if(boscoService.files) {
        boscoData.headers.push(_.keys(boscoService.files));
    }
    boscoData.headers = _.map(_.flatten(boscoData.headers), function(bundle) {
        return 'x-static|' + boscoData.name + '|' + bundle;
    });
}

module.exports = function(buildNumber, cdnUrl) {

    if (buildNumber === undefined) {
        var manifestPath = path.join(cwd, 'manifest.json')
        var manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath)) : {};
        buildNumber = manifest.build || 'local';
    }
    cdnUrl = cdnUrl || '';

    /*
     Craft a cdnUrl based on the bosco asset pipeline.
    */
    var createCdnUrl = function(request) {
        var baseCdnUrl = request.headers['x-cdn-url'] || cdnUrl || '';
        return url.resolve(url.resolve(baseCdnUrl, boscoData.name + '/'), buildNumber  + '/');
    }

    var hapiPlugin = function (plugin, options, next) {
        plugin.ext('onPostHandler', function(request, next) {
            if(!buildNumber) { return next(); }
            if(!request.response.headers) { return next() } // lab tests dont set this by default
            _.forEach(boscoData.headers, function(header) {
                request.response.headers[header] = buildNumber;
            });
            request.pre.cdnUrl = createCdnUrl(request);
            next();
        })
        next()
    }
    hapiPlugin.attributes = _.pick(packageJson, 'name', 'version');

    var middleware = function(req, res, next) {
        if(!buildNumber) { return next(); }
        _.forEach(boscoData.headers, function(header) {
            res.setHeader(header, buildNumber);
        });
        req.headers['x-cdn-url'] = createCdnUrl(req);
        next();
    }

    return {
        middleware: middleware,
        register: hapiPlugin,
        headers: boscoData.headers,
        name: boscoData.name,
        buildNumber: buildNumber
    };
};

