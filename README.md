# tp-platform

[![Build Status](https://www.travis-ci.org/typescript-practice/platform.svg?branch=master)](https://www.travis-ci.org/typescript-practice/platform)
[![Coverage Status](https://coveralls.io/repos/github/typescript-practice/platform/badge.svg?branch=master)](https://coveralls.io/github/typescript-practice/platform?branch=master)
[![npm version](https://img.shields.io/npm/v/tp-platform.svg?style=flat-square)](https://www.npmjs.com/package/tp-platform)
[![monthly downloads](https://img.shields.io/npm/dm/tp-platform.svg?style=flat-square)](https://www.npmjs.com/package/tp-platform)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![UNPKG](https://img.shields.io/badge/unpkg.com--green.svg)](https://unpkg.com/tp-platform@latest/dist/platform.umd.js)
[![liense](https://img.shields.io/github/license/typescript-practice/platform.svg)]()

## Intro

Match the current platform and get the platform parameters and execute the initialization process.

## Example

```js
import { Platform, setupPlatform, mergeConfigs, PLATFORM_CONFIGS } from 'tp-platform';

const plt = setupPlatform({
  // configs
});

plt.platforms(); // 
plt.settings(); // 
plt.versions(); // 
console.log(plt.is('ios'));
```

## Install

[![NPM Badge](https://nodei.co/npm/tp-platform.png?downloads=true)](https://www.npmjs.com/package/tp-platform)

 
## API

All exports here.

```js
import { Platform, setupPlatform, mergeConfigs, PLATFORM_CONFIGS } from 'tp-platform';
```

### ```new Platform(platformConfigs: PlatformConfigs)```

The Platform service can be used to get information about your current device.
You can get all of the platforms associated with the device using the platforms
method, including whether the app is being viewed from a tablet, if it's
on a mobile device or browser, and the exact platform (iOS, Android, Windows, etc).
You can also get the orientation of the device, if it uses right-to-left
language direction, and much much more. With this information you can completely
customize your app to fit any device.

Here is the doc of [Instance Members]()!

### ```setupPlatform(platformConfigs: PlatformConfigs)```

Setup platform with default platform configs.

* `@param {PlatformConfigs} platformConfigs ` - The configs to match platforms
* `@return {Platform}` - Return platform instance

The code like this: 

```js
function setupPlatform(platformConfigs: PlatformConfigs): Platform {
  const _finalConf = mergeConfigs(PLATFORM_CONFIGS, platformConfigs);
  return new Platform(_finalConf);
}
```

### ```mergeConfigs(defaultConfigs: PlatformConfigs, customerConfig: PlatformConfigs)```

Merge Parameters, and the priority here: 

1. Custom parameters have higher priority than the default configuration,
    such as `core` configuration, custom priority is higher than the default.
2. In the `plt.platforms()` array, the more advanced Platform parameters,
    the higher the priority is, for example: core < mobile < ios < iphone < cordova.
3. The plain object will use `assign` to collect params, other types of parameters will be replaced directly.

* `@param {PlatformConfigs} defaultConfigs ` - The dist configs
* `@param {PlatformConfigs} customerConfigs ` - The customer configs
* `@return {PlatformConfigs}` 

### ```PLATFORM_CONFIGS```

Default parameters for platform configuration, Including the common platform configuration. [Here](https://github.com/typescript-practice/platform/blob/master/src/lib/platform-registry.ts#L19) is the code.


## Development

 - `npm t`: Run test suite
 - `npm start`: Run `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)


## Reference

- [Ionic platform](https://ionicframework.com/docs/api/platform/Platform/)

## License

MIT
