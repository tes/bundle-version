Middleware and plugin that provides response headers that show the bundle versions this service expects to work with.

# Usage (above your app routers)
```js
var buildNumber = config.get('build'); // Or whatever appropriate in your environment
var buildVersion = require('bundle-version')(buildNumber, cdnUrl);
app.use(buildVersion.middleware);

```

Typically you would have a build number in a runtime configuration file (added to a service docker file by Jenkins for example as part of the build).

```
{
 'build':102
}
```

The assetBase name can be anything you like, it defaults to 'assets', but if you use Bosco as part of your static asset pipeline will form part of the URL generation for the CDN:

```
{{header['x-cdn-url'] || cdnUrl }}/{{serviceName}}/{{buildVersion}}/
```

In the above example, the cdnBaseUrl is provided to the service via a 'x-cdn-url' header.  If you do not use this header you can pass the entire cdnUrl through as the cdnUrl property when creating the middleware (no trailing slash).

## Accessing the CDN Url

If you use a combination of Bosco + Compoxure (or either), this middleware also sets a CDN Url property for you that ensures that any references to images or other items works correctly based on the service build number.

### Express

The configuration is appended to the application config, accessible on each request.

```
  req.app.get('cdnUrl');
```

### Hapi

The configuration is appended to the pre object on the request (similar to a pre handler).

```
  request.pre.cdnUrl
```

TODO: Confirm the Hapi version actually works.
