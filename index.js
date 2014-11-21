'use strict';

var cwd = process.cwd();
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var headers = getHeaders();
var packageJson = require('./package.json')

module.exports = function(buildNumber) {

    if (buildNumber === undefined) {
        var manifestPath = path.join(cwd, 'manifest.json')
        var manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath)) : {};
        buildNumber = manifest.build
    }

    var hapiPlugin = function (plugin, options, next) {
        plugin.ext('onPostHandler', function(request, next) {
            if(!buildNumber) return next();
            _.forEach(headers, function(header) {
                request.response.headers[header] = buildNumber
            });
            next();
        })
        next()
    }
    hapiPlugin.attributes = _.pick(packageJson, 'name', 'version');

    var middleware = function(req, res, next) {
        if(!buildNumber) return next();
        _.forEach(headers, function(header) {
            res.setHeader(header, buildNumber);
        });
        next();
    }

    return {
        middleware: middleware,
        register: hapiPlugin,
        headers: headers,
        buildNumber: buildNumber
    };
};

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
            return "cx-bundle|" + bundle;
        });
        return bundles;
    } else {
        return [];
    }

}

