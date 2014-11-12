# module-tsl-build-version

Middleware and plugin that provides response headers that show the bundle versions this service expects to work with.

# Usage (above your app routers)
```js
var buildVersion = require('module-tsl-build-version');
app.use(buildVersion.middleware);

```

# Expects that you have supplied a build number in a runtime configuration file (added to the service docker file by Jenkins).

{
 'build':102
}
