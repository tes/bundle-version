Middleware and plugin that provides response headers that show the bundle versions this service expects to work with.

# Usage (above your app routers)
```js
var buildNumber = config.get('build'); // Or whatever appropriate in your environment
var buildVersion = require('bundle-version')(buildNumber);
app.use(buildVersion.middleware);

```

Typically you would have a build number in a runtime configuration file (added to a service docker file by Jenkins for example as part of the build).

{
 'build':102
}
