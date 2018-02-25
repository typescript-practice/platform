# Platform API

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
- [setLang(language: string, updateDocument: boolean)](#setlanglanguage-string-updatedocument-boolean)
- [lang(): string](#lang-string)
- [registerBackButtonAction(fn: Function, priority: number = 0): Function](#registerbackbuttonactionfn-function-priority-number--0-function)
- [getQueryParam(key: string)](#getqueryparamkey-string)
- [url(): string](#url-string)
- [width(): number](#width-number)
- [height(): number](#height-number)
- [isPortrait(): boolean | null](#isportrait-boolean--null)
- [isLandscape(): boolean](#islandscape-boolean)
- [settings(): any](#settings-any)
- [Others(When code the `config.js`)](#otherswhen-code-the-configjs)
  - [prepareReady()](#prepareready)
  - [testNavigatorPlatform(navigatorPlatformExpression: string): boolean](#testnavigatorplatformnavigatorplatformexpression-string-boolean)
  - [matchUserAgentVersion(userAgentExpression: RegExp): any](#matchuseragentversionuseragentexpression-regexp-any)
  - [testUserAgent(expression: string): boolean](#testuseragentexpression-string-boolean)
  - [isPlatformMatch(queryStringName: string, userAgentAtLeastHas?: string[], userAgentMustNotHave: string[] = []): boolean](#isplatformmatchquerystringname-string-useragentatleasthas-string-useragentmustnothave-string---boolean)
  - [loadScript(url: string, cb: Function)](#loadscripturl-string-cb-function)
  - [loadJsSDK(sdkInfo: SDKInfo, successCallback: Function, errorCallback: Function): void {](#loadjssdksdkinfo-sdkinfo-successcallback-function-errorcallback-function-void-)

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

   
   
## setLang(language: string, updateDocument: boolean)


Set the app's language and optionally the country code, which will update
the `lang` attribute on the app's root `<html>` element.
We recommend the app's `index.html` file already has the correct `lang`
attribute value set, such as `<html lang="en">`. This method is useful if
the language needs to be dynamically changed per user/session.
[W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)

* `@param {string}` language  Examples: `en-US`, `en-GB`, `ar`, `de`, `zh`, `es-MX`
* `@param {boolean}` updateDocument  Specifies whether the `lang` attribute of `<html>` should be updated
   


## lang(): string


Returns app's language and optional country code.
We recommend the app's `index.html` file already has the correct `lang`
attribute value set, such as `<html lang="en">`.
[W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)

* `@returns {string}`



## registerBackButtonAction(fn: Function, priority: number = 0): Function


The back button event is triggered when the user presses the native
platform's back button, also referred to as the "hardware" back button.
This event is only used within Cordova apps running on Android and
Windows platforms. This event is not fired on iOS since iOS doesn't come
with a hardware back button in the same sense an Android or Windows device
does.

Registering a hardware back button action and setting a priority allows
apps to control which action should be called when the hardware back
button is pressed. This method decides which of the registered back button
actions has the highest priority and should be called.

* `@param {Function}` fn Called when the back button is pressed,
if this registered action has the highest priority.
* `@param {number}` priority Set the priority for this action. Only the highest priority will execute. Defaults to `0`.
* `@returns {Function}` A function that, when called, will unregister
the back button action.



## getQueryParam(key: string)

Get the query string parameter in url.

* `@param {string}` key - keyName


## url(): string

Get the current url.


## width(): number

Gets the width of the platform's viewport using `window.innerWidth`.
Using this method is preferred since the dimension is a cached value,
which reduces the chance of multiple and expensive DOM reads.

## height(): number

Gets the height of the platform's viewport using `window.innerHeight`.
Using this method is preferred since the dimension is a cached value,
which reduces the chance of multiple and expensive DOM reads.


## isPortrait(): boolean | null

Returns `true` if the app is in portrait mode.

## isLandscape(): boolean

Returns `true` if the app is in landscape mode.

## settings(): any

Get the final configuration for the matching platform.



## Others(When code the `config.js`)


When writing `config.js`, you need some utility functions to help with common problems, such as the ones listed below:


### prepareReady()

This is the default prepareReady if it's not replaced by an hybrid app,
such as Cordova or Electron. If there was no custom `prepareReady`
method overwrite from an hybrid then it uses the method by default, which triggers
the platform ready on the DOM ready event, and the default resolved
value is `dom`.

**Notice:** Used for hybrid app to overwrite to init their platform.

### testNavigatorPlatform(navigatorPlatformExpression: string): boolean

Check if the current window.navigator.platform parameter matches the specified regular parameter.

```js
plt.testNavigatorPlatform('win|mac|x11|linux'); // match desktop
```

### matchUserAgentVersion(userAgentExpression: RegExp): any

According to the incoming regular match current userAgent version number.

```js
plt.matchUserAgentVersion(/Android (\d+).(\d+)?/)
plt.matchUserAgentVersion(/OS (\d+)_(\d+)?/);
plt.matchUserAgentVersion(/micromessenger\/(\d+).(\d+).(\d+)?/i);
plt.matchUserAgentVersion(/alipayclient\/(\d+).(\d+).(\d+)?/i);
plt.matchUserAgentVersion(/dingtalk\/(\d+).(\d+).(\d+)?/i);
```

### testUserAgent(expression: string): boolean

Test if the incoming string matches userAgent.


```js
plt.testUserAgent('iphone'); // true or false
```

### isPlatformMatch(queryStringName: string, userAgentAtLeastHas?: string[], userAgentMustNotHave: string[] = []): boolean

When writing a platform configuration using this method, the address bar parameters will affect the results of the final `plt.platforms ()` method, such as [Example](#Example) mentioned above.

The wechat / alipay / dingtalk these three different platforms Correct matching initialization, if the address bar is: 

```
http://xxx/xx/?platform=core;mobile;ios;wechat
```

The `plt.platforms()` will returns```["core", "mobile", "ios", "wechat"]```. Including the corresponding `plt.settings ()`, this technique can be used to simulate on other platforms.


**Example here:**


```js
plt.isPlatformMatch('alipay', ['alipay', 'alipayclient']);
plt.isPlatformMatch('wechat', ['micromessenger']);
```

### loadScript(url: string, cb: Function)

Methods to load external js files.

```js
const jsSDKUrl = '//g.alicdn.com/dingding/open-develop/1.6.9/dingtalk.js';
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
```


### loadJsSDK(sdkInfo: [SDKInfo](https://github.com/typescript-practice/platform/blob/master/src/lib/interface.ts#L34), successCallback: Function, errorCallback: Function): void {

Methods to load JSSDK, including successful or failed callbacks.

* `@param {SDKInfo}` sdkInfo
* `@param {string}` sdkInfo.jsSDKUrl - The script url
* `@param {string}` sdkInfo.jsSDKName - The name of jssdk on `window`, like: window.WeixinJSBridge
* `@param {string}` sdkInfo.jsSDKEventName - Event name, When `window.WeixinJSBridge` is undefined, then listen event of `WeixinJSBridgeReady`
* `@param {number}` [sdkInfo.timeout=10000] - timeout
* `@param {Function}` successCallback
* `@param {Function}` errorCallback


```js
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
```
