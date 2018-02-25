# `Platform` Instance Members

Get instance like this:

```js
import { Platform } from 'tp-platform';

const config = {}
const plt = new Platform(config);
```

## `constructor(platformConfigs: PlatformConfigs) `











## `plt.is()`

Set(reset) all configs.

* `@param {object} [configs]` - The configs object will be reset
* `@return {object} this` - Return this value

```js
let config = new Config();
config.settings({
  name: "Doc Brown",
  occupation: "Weather Man"
});

expect(config.get("name")).toEqual("Doc Brown");
expect(config.get("occupation")).toEqual("Weather Man");
```
