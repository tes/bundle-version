'use strict';

var cwd = process.cwd();
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var headers = getHeaders();

module.exports = function(buildNumber) {
    return {
        middleware: function(req, res, next) {
            if(!buildNumber) return next();
            _.forEach(headers, function(header) {
                res.setHeader(header, buildNumber);
            });
            next();
        },
        register: function (plugin, options, next) {
            // TODO Plugin version
            return next();
        },
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

