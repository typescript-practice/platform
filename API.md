# `Platform` API

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Example](#example)
- [constructor(platformConfigs: PlatformConfigs)](#constructorplatformconfigs-platformconfigs)
- [is(platformName: string): boolean](#isplatformname-string-boolean)
- [platforms(): Array<string>](#platforms-arraystring)
- [versions(): { [name: string]: PlatformVersion }](#versions--name-string-platformversion-)
- [ready(): Promise<string>](#ready-promisestring)
- [setDir(dir: DocumentDirection, updateDocument: boolean)](#setdirdir-documentdirection-updatedocument-boolean)
- [dir(): DocumentDirection](#dir-documentdirection)
- [Others(When code the `customerConfig.js`)](#otherswhen-code-the-customerconfigjs)
  - [prepareReady()](#prepareready)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Example

**Scenario description**: The current project is a mobile project and needs to run in *wechat / alipay / dingtalk* three hybrid environments, and corresponding initializations are performed for the three hybrid environments, including obtaining the corresponding platform configuration / versions / loading JSSDK, etc. In addition, *Nexus* series of mobile phones to do special treatment.


**config.js file**

```js
export default {
 'wechat': {
    type: 4,
    initialize: function (plt) {
      plt.prepareReady = function () {
        const jsSDKUrl = '//res.wx.qq.com/open/js/jweixin-1.0.0.js';
        const jsSDKName = 'WeixinJSBridge';
        const jsSDKEventName = 'WeixinJSBridgeReady';
        plt.loadJsSDK({
          jsSDKUrl: jsSDKUrl,
          jsSDKName: jsSDKName,
          jsSDKEventName: jsSDKEventName,
          timeout: 10000
        }, function (successData) {
          console.debug(successData);
          plt.triggerReady('wechat');
        }, function (errorData) {
          console.debug(errorData);
          plt.triggerFail('wechat'); // to plt.ready()
        });
      };
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function (plt) {
      return plt.isPlatformMatch('wechat', ['micromessenger']);
    },
    versionParser: function (plt) {
      return plt.matchUserAgentVersion(/micromessenger\/(\d+).(\d+).(\d+)?/i);
    }
  },
  'alipay': {
    type: 4,
    initialize: function (plt) {
      // overwrite prepareReady function
      plt.prepareReady = function () {
        const jsSDKUrl = '//a.alipayobjects.com/g/h5-lib/alipayjsapi/3.0.2/alipayjsapi.min.js';
        const jsSDKName = 'AlipayJSBridge';
        const jsSDKEventName = 'AlipayJSBridgeReady';
        // check and load js sdk
        plt.loadJsSDK({
          jsSDKUrl: jsSDKUrl,
          jsSDKName: jsSDKName,
          jsSDKEventName: jsSDKEventName,
          timeout: 100
        }, function (successData) {
          console.debug(successData);
          plt.triggerReady('alipay'); // to plt.ready()
        }, function (errorData) {
          console.debug(errorData);
          plt.triggerFail('alipay'); // to plt.ready()
        });
      };
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function (plt) {
      return plt.isPlatformMatch('alipay', ['alipay', 'alipayclient']);
    },
    versionParser: function (plt) {
      return plt.matchUserAgentVersion(/alipayclient\/(\d+).(\d+).(\d+)?/i);
    },
  },
  'dingtalk': {
    type: 4,
    initialize: function (plt) {
      plt.prepareReady = function () {
        const jsSDKUrl = '//g.alicdn.com/dingding/open-develop/1.6.9/dingtalk.js';
        var timer = window.setTimeout(function () {
          plt.triggerFail('dingtalk timeout')
        }, 10000);

        plt.loadScript(jsSDKUrl, function () {
          window.dd.ready(function () {
            plt.triggerReady('dingtalk');
            timer && window.clearTimeout(timer)
          });

          window.dd.error(function (err) {
            plt.triggerFail('dingtalk dd.error');
            timer && window.clearTimeout(timer)
          })
        })
      };
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function (plt) {
      return plt.isPlatformMatch('dingtalk')
    },
    versionParser: function (plt) {
      return plt.matchUserAgentVersion(/dingtalk\/(\d+).(\d+).(\d+)?/i)
    }
  },
  'nexus': {
    type: 3,
    isMatch: function (plt) {
      return plt.isPlatformMatch('nexus', ['nexus'])
    },
  },
}
```

**main.js file**

```js
import { setupPlatform } from 'tp-platform';
import customerConfig from 'path/to/config.js';
const plt = setupPlatform(customerConfig);

console.log(plt);
console.log(plt.platforms());
console.log(plt.settings());
console.log(plt.versions());
console.log(plt.is('ios'));

plt.ready().then(function (readySource) {
  switch (readySource) {
    case 'dom':
      console.log('web env');
      break;
    case 'cordova':
      console.log('cordova env');
      break;
    case 'electron':
      console.log('electron env');
      break;
    case 'alipay':
      console.log('alipay env');
      break;
    case 'dingtalk':
      console.log('dingtalk env');
      break;
    case 'wechat':
      console.log('wechat env');
      break;
    default:
      console.log(readySource + ' nor found!');
  }
}, function (reason) {
  console.log('ready reject', reason)
})
```



## constructor(platformConfigs: [PlatformConfigs](https://github.com/typescript-practice/platform/blob/master/src/lib/interface.ts#L8))

The class of ```Platform``` do the following when creating an instance: 

1. Set private properties.
2. Identify the current platform.
3. Recursively obtain the platform settings based on the identified platform.
4. Perform the initialization method for each matching platform.
5. Complete the initialization process.

**The type of [`PlatformConfigs`](https://github.com/typescript-practice/platform/blob/master/src/lib/interface.ts#L8) is as follows:**

```ts
type PlatformConfigs = { [key: string]: PlatformConfig };

// Use type to determine uniqueness;
// For example: 'ios' and 'android' will not co-exist at the same time
enum Type {BASE = 0, PLATFORM = 1, SYSTEM = 2, BRAND = 3, ENVIRONMENT = 4}

interface PlatformConfig {
  type: Type;
  initialize?: Function;
  settings?: {}; // The settings of this platform
  isMatch?: Function; // The function to match this plarform
  versionParser?: Function;
}
```

## is(platformName: string): boolean

Depending on the platform the user is on, `is(platformName)` will
return `true` or `false`. Note that the same app can return `true`
for more than one platform name. For example, an app running from
an iPad would return `true` for the platform names: `mobile`,
`ios`, `ipad`, and `tablet`. Additionally, if the app was running
from Cordova then `cordova` would be true, and if it was running
from a web browser on the iPad then `web` would be `true`.

**The default supported platforms are:**

| Type  | Type Name   | Platform Name   | Description                        |
|-------|-------------|-----------------|------------------------------------|
| 0     | Base        | core            | base application.                  |
| 1     | Platform    | mobile          | on a mobile platform.              |
| 1     | Platform    | tablet          | on a tablet platform.              |
| 1     | Platform    | desktop         | on a desktop platform.             |
| 2     | System      | android         | on a device running Android System.|
| 2     | System      | ios             | on a device running iOS System.    |
| 2     | System      | linux           | on a device running Linux System.  |
| 2     | System      | windows         | on a device running Windows System.|
| 2     | System      | mac             | on a device running Mac OS.        |
| 3     | Brand       | ipad            | on an iPad device.                 |
| 3     | Brand       | iphone          | on an iPhone device.               |
| 4     | Environment | cordova         | on a hybrid environment(cordova).  |
| 4     | Environment | electron        | on a hybrid environment(electron). |
| 4     | Environment | web             | on an normal web browser.        |
   
* `@param {string} platformName` - The platform want to match
* `@return {boolean}` - Returns true / false based on platform.

```js
import { setupPlatform } from 'tp-platform';

const plt = setupPlatform({});
plt.is('ios');  // true or false
```

## platforms(): Array<string>


Depending on what device you are on, `platforms` can return multiple values.
Each possible value is a type of platforms. For example, on an iPhone,
it would return `core`, `mobile`, `ios`, and `iphone`.

* `@returns {array}` the array of platforms

```js
import { setupPlatform } from 'tp-platform';

const plt = setupPlatform({});
plt.platforms();  // ['core', 'mobile', 'ios', 'iphone'].
```


## versions(): { [name: string]: [PlatformVersion](https://github.com/typescript-practice/platform/blob/master/src/lib/interface.ts#L16) }

Returns an object containing version information about all of the platforms if it has version.

* `@returns {object}` An object containing all of the platforms and their versions.

```js
import { setupPlatform } from 'tp-platform';

const plt = setupPlatform({});
plt.versions();  // {ios: {str: "10.3.0", num: 10.3, major: 10, minor: 3, patch: 0}}.
```


## ready(): Promise<string>


Returns a promise when the platform is ready and native functionality
can be called. If the app is running from within a web browser, then
the promise will resolve when the DOM is ready. When the app is running
from an hybrid application such as Cordova/Electron/Weichat/Alipay,
then the promise will resolve when hybrid application execute the
`triggerReady` function.

The resolved value is the `readySource`, which states which platform
ready was used. For example, when Cordova is ready, the resolved ready
source is `cordova`. The default ready source value will be `dom`. The
`readySource` is useful if different logic should run depending on the
platform the app is running from. For example, only Cordova can execute
the status bar plugin, so the web should not run status bar plugin logic.

**Notice:**

Trigger Promise resolved method is [triggerReady()](https://github.com/typescript-practice/platform/blob/master/src/platform.ts#L265) and rejected method is [triggerFail()](https://github.com/typescript-practice/platform/blob/master/src/platform.ts#L269). Sometimes you need to manually trigger these two methods in the `config`, just as `Dingtalk` used in [Example](#Example).



* `@returns {promise}`

```js
import { setupPlatform } from 'tp-platform';

const plt = setupPlatform({});
plt.ready().then(function (readySource) {
  switch (readySource) {
    case 'dom':
       console.log('web env');
       break;
     case 'cordova':
       console.log('cordova env');
       break;
     case 'electron':
       console.log('electron env');
       break;
    case 'alipay':
       console.log('alipay env');
       break;
    case 'dingtalk':
       console.log('dingtalk env');
       break;
    case 'wechat':
       console.log('wechat env');
       break;
    default:
       console.log(readySource + ' not found!');
   }
}, function (reason) {
  console.error('ready error', reason)
});
```

## setDir(dir: DocumentDirection, updateDocument: boolean)

Set the app's language direction, which will update the `dir` attribute
on the app's root `<html>` element. We recommend the app's `index.html`
file already has the correct `dir` attribute value set, such as
`<html dir="ltr">` or `<html dir="rtl">`. This method is useful if the
direction needs to be dynamically changed per user/session.
[W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)

* `@param {DocumentDirection}` dir  Examples: `rtl`, `ltr`
* `@param {boolean}` updateDocument


## dir(): DocumentDirection 

Returns app's language direction.
We recommend the app's `index.html` file already has the correct `dir`
attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
[W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)

* `@returns {DocumentDirection}`

   
   
## Others(When code the `customerConfig.js`)




### prepareReady()





