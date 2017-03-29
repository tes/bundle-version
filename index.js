'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');
var _ = require('lodash');
var packageJson = require('./package.json');

var cwd;
var pm2Exec = process.env.pm_exec_path;
if (pm2Exec) {
  // If exec path is a file, get the directory of that file
  cwd = Boolean(path.extname(pm2Exec)) ? path.dirname(pm2Exec) : pm2Exec;
} else {
  cwd = process.cwd();
}

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
    boscoData.headers.push('x-static|' + boscoData.name);
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

