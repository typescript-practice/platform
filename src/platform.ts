'use strict'

import { getCss } from './lib/dom'
import QueryParams from './lib/query-params'
import PLATFORM_CONFIGS from './lib/platform-registry'
import mergeConfigs from './lib/merge-configs'
import PlatformNode from './lib/PlatformNode'
import {
  DocumentDirection,
  EventListenerOptions,
  PlatformConfig,
  PlatformConfigs,
  PlatformVersion,
  SDKInfo,
  Type
} from './lib/interface'

export { mergeConfigs, PLATFORM_CONFIGS }

/**
 * @class Platform
 * @description
 * The Platform service can be used to get information about your current device.
 * You can get all of the platforms associated with the device using the [platforms](#platforms)
 * method, including whether the app is being viewed from a mobile/tablet/desktop, if it's
 * on a mobile device or browser, and the exact System (iOS, Android, Windows etc).
 * You can also get the orientation of the device, if it uses right-to-left
 * language direction, and much much more. With this information you can completely
 * customize your app to fit any device.
 *
 * @example
 * ```ts
 * import { Platform } from 'tp-platform';
 *
 * const plt = new Platform({});
 * ```
 */
export class Platform {
  /** @internal */
  Css: {
    transform?: string
    transition?: string
    transitionDuration?: string
    transitionDelay?: string
    transitionTimingFn?: string
    transitionStart?: string
    transitionEnd?: string
    transformOrigin?: string
    animationDelay?: string
  } = {}

  /** @internal */
  _platforms: string[] = []
  _settings: any = {}

  /**
   * Returns if this app is using right-to-left language direction or not.
   * We recommend the app's `index.html` file already has the correct `dir`
   * attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
   * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
   * @returns {boolean}
   */
  isRTL: boolean

  private _win: Window
  private _doc: HTMLDocument
  private _versions: { [name: string]: PlatformVersion } = {}
  private _dir: DocumentDirection
  private _lang: string = ''
  private _ua: string = ''
  private _qp = new QueryParams() // init settings
  private _nPlt: string = ''
  private _readyPromise: Promise<any>
  private _readyResolve: any
  private _readyReject: any
  // private _bbActions: BackButtonAction[] = [];
  private _registry: { [name: string]: PlatformConfig } = {}
  private _core: string = ''
  private _pW = 0
  private _pH = 0
  private _lW = 0
  private _lH = 0
  private _isPortrait: boolean | null = null
  private _uiEvtOpts = false

  constructor(platformConfigs: PlatformConfigs) {
    const doc = document
    const win = doc.defaultView // read-only
    const docElement = doc.documentElement
    const dir = docElement.dir
    const platform = win.navigator.platform
    const userAgent = win.navigator.userAgent

    this.setCore('core')
    this._registry = platformConfigs || {} // all platform configs

    // set values from "document"
    this._doc = doc
    this._dir = dir === 'rtl' ? 'rtl' : 'ltr'
    this.isRTL = dir === 'rtl'
    this.setLang(docElement.lang, false)

    // set css properties
    this.setCssProps(docElement)

    // set values from "window"
    this._win = win
    this.setNavigatorPlatform(platform)
    this.setUserAgent(userAgent)

    // set location values
    this.setQueryParams(win.location.href)

    // ready promise
    this._readyPromise = new Promise((res, rej) => {
      this._readyResolve = res
      this._readyReject = rej
    })

    // TODO: back button
    // this.backButton.subscribe(() => {
    //   // the hardware back button event has been fired
    //   console.debug('hardware back button');
    //
    //   // decide which backbutton action should run
    //   this.runBackButtonAction();
    // });

    this.init()
  }

  // Methods
  // **********************************************

  /**
   * @returns {boolean} returns true/false based on platform.
   * @description
   * Depending on the platform the user is on, `is(platformName)` will
   * return `true` or `false`. Note that the same app can return `true`
   * for more than one platform name. For example, an app running from
   * an iPad would return `true` for the platform names: `mobile`,
   * `ios`, `ipad`, and `tablet`. Additionally, if the app was running
   * from Cordova then `cordova` would be true, and if it was running
   * from a web browser on the iPad then `web` would be `true`.
   *
   * ```
   * import { setupPlatform } from 'tp-platform';
   *
   * const plt = setupPlatform({});
   * plt.is('ios');  // true or false
   * ```
   *
   * | Type  | Type Name   | Platform Name   | Description                        |
   * |-------|-------------|-----------------|------------------------------------|
   * | 0     | Base        | core            | base application.                  |
   * | 1     | Platform    | mobile          | on a mobile platform.              |
   * | 1     | Platform    | tablet          | on a tablet platform.              |
   * | 1     | Platform    | desktop         | on a desktop platform.             |
   * | 2     | System      | android         | on a device running Android System.|
   * | 2     | System      | ios             | on a device running iOS System.    |
   * | 2     | System      | linux           | on a device running Linux System.  |
   * | 2     | System      | windows         | on a device running Windows System.|
   * | 2     | System      | mac             | on a device running Mac OS.        |
   * | 3     | Brand       | ipad            | on an iPad device.                 |
   * | 3     | Brand       | iphone          | on an iPhone device.               |
   * | 4     | Environment | cordova         | on a hybrid environment(cordova).  |
   * | 4     | Environment | electron        | on a hybrid environment(electron). |
   * | 4     | Environment | web             | on an ordinary web browser.        |
   *
   * @param {string} platformName
   */
  is(platformName: string): boolean {
    return this._platforms.indexOf(platformName) > -1
  }

  /**
   * @returns {array} the array of platforms
   * @description
   * Depending on what device you are on, `platforms` can return multiple values.
   * Each possible value is a type of platforms. For example, on an iPhone,
   * it would return `core`, `mobile`, `ios`, and `iphone`.
   *
   * ```
   * import { setupPlatform } from 'tp-platform';
   *
   * const plt = setupPlatform({});
   * plt.platforms();  // ['core', 'mobile', 'ios', 'iphone'].
   * ```
   */
  platforms(): Array<string> {
    return this._platforms
  }

  /**
   * Returns an object containing version information about all of the platforms.
   *
   * ```
   * import { setupPlatform } from 'tp-platform';
   *
   * const plt = setupPlatform({});
   * plt.versions();  // {ios: {str: "10.3.0", num: 10.3, major: 10, minor: 3, patch: 0}}.
   * ```
   *
   * @returns {object} An object containing all of the platforms and their versions.
   */
  versions(): { [name: string]: PlatformVersion } {
    // get all the platforms that have a valid parsed version
    return this._versions
  }

  /**
   * Returns a promise when the platform is ready and native functionality
   * can be called. If the app is running from within a web browser, then
   * the promise will resolve when the DOM is ready. When the app is running
   * from an hybrid application such as Cordova/Electron/Weichat/Alipay,
   * then the promise will resolve when hybrid application execute the
   * `triggerReady` function.
   *
   * The resolved value is the `readySource`, which states which platform
   * ready was used. For example, when Cordova is ready, the resolved ready
   * source is `cordova`. The default ready source value will be `dom`. The
   * `readySource` is useful if different logic should run depending on the
   * platform the app is running from. For example, only Cordova can execute
   * the status bar plugin, so the web should not run status bar plugin logic.
   *
   * ```
   * import { setupPlatform } from 'tp-platform';
   *
   * const plt = setupPlatform({});
   * plt.ready().then(function (readySource) {
   *    switch (readySource) {
   *      case 'dom':
   *        console.log('web env');
   *        break;
   *      case 'cordova':
   *        console.log('cordova env');
   *        break;
   *      case 'electron':
   *        console.log('electron env');
   *        break;
   *      case 'alipay':
   *        console.log('alipay env');
   *        break;
   *      case 'dingtalk':
   *        console.log('dingtalk env');
   *        break;
   *      case 'wechat':
   *        console.log('wechat env');
   *        break;
   *      default:
   *        console.log(readySource + ' not found!');
   *    }
   * }, function (reason) {
   *   console.error('ready error', reason)
   * });
   * ```
   * @returns {promise}
   */
  ready(): Promise<string> {
    return this._readyPromise
  }

  /**
   * @hidden
   * This should be triggered by the engine when the platform is
   * ready. If there was no custom prepareReady method from the engine,
   * such as Cordova or Electron, then it uses the default DOM ready.
   */
  triggerReady(readySource: string) {
    this._readyResolve(readySource)
  }

  triggerFail(reason: string) {
    this._readyReject(reason)
  }

  /**
   * @hidden
   * This is the default prepareReady if it's not replaced by an hybrid app,
   * such as Cordova or Electron. If there was no custom prepareReady
   * method from an engine then it uses the method below, which triggers
   * the platform ready on the DOM ready event, and the default resolved
   * value is `dom`.
   */
  prepareReady() {
    const self = this
    /* istanbul ignore else */
    if (self._doc.readyState === 'complete' || self._doc.readyState === 'interactive') {
      self.triggerReady('dom')
    } else {
      self._doc.addEventListener('DOMContentLoaded', completed, false)
      self._win.addEventListener('load', completed, false)
    }

    /* istanbul ignore next */
    function completed() {
      self._doc.removeEventListener('DOMContentLoaded', completed, false)
      self._win.removeEventListener('load', completed, false)
      self.triggerReady('dom')
    }
  }

  /**
   * Set the app's language direction, which will update the `dir` attribute
   * on the app's root `<html>` element. We recommend the app's `index.html`
   * file already has the correct `dir` attribute value set, such as
   * `<html dir="ltr">` or `<html dir="rtl">`. This method is useful if the
   * direction needs to be dynamically changed per user/session.
   * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
   * @param {DocumentDirection} dir  Examples: `rtl`, `ltr`
   * @param {boolean} updateDocument
   */
  setDir(dir: DocumentDirection, updateDocument: boolean) {
    this._dir = dir
    this.isRTL = dir === 'rtl'

    if (updateDocument !== false) {
      this._doc['documentElement'].setAttribute('dir', dir)
    }
  }

  /**
   * Returns app's language direction.
   * We recommend the app's `index.html` file already has the correct `dir`
   * attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
   * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
   * @returns {DocumentDirection}
   */
  dir(): DocumentDirection {
    return this._dir
  }

  /**
   * Set the app's language and optionally the country code, which will update
   * the `lang` attribute on the app's root `<html>` element.
   * We recommend the app's `index.html` file already has the correct `lang`
   * attribute value set, such as `<html lang="en">`. This method is useful if
   * the language needs to be dynamically changed per user/session.
   * [W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)
   * @param {string} language  Examples: `en-US`, `en-GB`, `ar`, `de`, `zh`, `es-MX`
   * @param {boolean} updateDocument  Specifies whether the `lang` attribute of `<html>` should be updated
   */
  setLang(language: string, updateDocument: boolean) {
    this._lang = language
    if (updateDocument !== false) {
      this._doc['documentElement'].setAttribute('lang', language)
    }
  }

  /**
   * Returns app's language and optional country code.
   * We recommend the app's `index.html` file already has the correct `lang`
   * attribute value set, such as `<html lang="en">`.
   * [W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)
   * @returns {string}
   */
  lang(): string {
    return this._lang
  }

  // Methods meant to be overridden by the engine
  // **********************************************
  // Provided NOOP methods so they do not error when
  // called by engines (the browser)that do not provide them

  // /**
  //  * @hidden
  //  */
  // exitApp() {
  // }

  // Events meant to be triggered by the engine
  // **********************************************

  // TODO: Provide || Write EventEmitter Lib
  // /**
  //  * @hidden
  //  */
  // backButton: EventEmitter<Event> = new EventEmitter<Event>();

  // /**
  //  * The pause event emits when the native platform puts the application
  //  * into the background, typically when the user switches to a different
  //  * application. This event would emit when a Cordova app is put into
  //  * the background, however, it would not fire on a standard web browser.
  //  */
  // pause: EventEmitter<Event> = new EventEmitter<Event>();

  // /**
  //  * The resume event emits when the native platform pulls the application
  //  * out from the background. This event would emit when a Cordova app comes
  //  * out from the background, however, it would not fire on a standard web browser.
  //  */
  // resume: EventEmitter<Event> = new EventEmitter<Event>();

  // /**
  //  * The resize event emits when the browser window has changed dimensions. This
  //  * could be from a browser window being physically resized, or from a device
  //  * changing orientation.
  //  */

  // resize: EventEmitter<Event> = new EventEmitter<Event>();

  // /**
  //  * The back button event is triggered when the user presses the native
  //  * platform's back button, also referred to as the "hardware" back button.
  //  * This event is only used within Cordova apps running on Android and
  //  * Windows platforms. This event is not fired on iOS since iOS doesn't come
  //  * with a hardware back button in the same sense an Android or Windows device
  //  * does.
  //  *
  //  * Registering a hardware back button action and setting a priority allows
  //  * apps to control which action should be called when the hardware back
  //  * button is pressed. This method decides which of the registered back button
  //  * actions has the highest priority and should be called.
  //  *
  //  * @param {Function} fn Called when the back button is pressed,
  //  * if this registered action has the highest priority.
  //  * @param {number} priority Set the priority for this action. Only the highest priority will execute. Defaults to `0`.
  //  * @returns {Function} A function that, when called, will unregister
  //  * the back button action.
  //  */
  // registerBackButtonAction(fn: Function, priority: number = 0): Function {
  //   const action: BackButtonAction = {fn, priority};
  //
  //   this._bbActions.push(action);
  //
  //   // return a function to unregister this back button action
  //   return () => {
  //     // removeArrayItem(this._bbActions, action);
  //   };
  // }

  // /**
  //  * @hidden
  //  */
  // runBackButtonAction() {
  //   // decide which one back button action should run
  //   let winner: any;
  //   this._bbActions.forEach((action: BackButtonAction) => {
  //     if (!winner || action.priority >= winner.priority) {
  //       winner = action;
  //     }
  //   });
  //
  //   // run the winning action if there is one
  //   winner && winner.fn && winner.fn();
  // }

  // Getter/Setter Methods
  // **********************************************

  /**
   * @hidden
   */
  win() {
    return this._win
  }

  /**
   * @hidden
   */
  setWindow(win: Window) {
    this._win = win
  }

  /**
   * @hidden
   */
  doc() {
    return this._doc
  }

  /**
   * @hidden
   */
  setDocument(doc: HTMLDocument) {
    this._doc = doc
  }

  /**
   * @hidden
   */
  setCssProps(docElement: HTMLElement) {
    this.Css = getCss(docElement)
  }

  /**
   * Get the final configuration for the matching platform.
   */
  settings(): any {
    return this._settings
  }

  /**
   * @hidden
   */
  userAgent(): string {
    return this._ua || ''
  }

  /**
   * @hidden
   */
  setUserAgent(userAgent: string) {
    this._ua = userAgent
  }

  /**
   * @hidden
   */
  setQueryParams(url: string) {
    this._qp.parseUrl(url)
  }

  /**
   * Get the query string parameter
   */
  getQueryParam(key: string) {
    return this._qp.get(key)
  }

  /**
   * Get the current url.
   */
  url() {
    return this._win['location']['href']
  }

  /**
   * @hidden
   */
  navigatorPlatform(): string {
    return this._nPlt || ''
  }

  /**
   * @hidden
   */
  setNavigatorPlatform(navigatorPlt: string) {
    this._nPlt = navigatorPlt
  }

  /**
   * Gets the width of the platform's viewport using `window.innerWidth`.
   * Using this method is preferred since the dimension is a cached value,
   * which reduces the chance of multiple and expensive DOM reads.
   */
  width(): number {
    this._calcDim()
    return this._isPortrait ? this._pW : this._lW
  }

  /**
   * Gets the height of the platform's viewport using `window.innerHeight`.
   * Using this method is preferred since the dimension is a cached value,
   * which reduces the chance of multiple and expensive DOM reads.
   */
  height(): number {
    this._calcDim()
    return this._isPortrait ? this._pH : this._lH
  }

  /**
   * Returns `true` if the app is in portait mode.
   */
  isPortrait(): boolean {
    this._calcDim()
    return this._isPortrait as boolean
  }

  /**
   * Returns `true` if the app is in landscape mode.
   */
  isLandscape(): boolean {
    return !this.isPortrait()
  }

  /* istanbul ignore next */
  /**
   * @hidden
   * Built to use modern event listener options, like "passive".
   * If options are not supported, then just return a boolean which
   * represents "capture". Returns a method to remove the listener.
   */
  registerListener(
    ele: any,
    eventName: string,
    callback: { (ev?: UIEvent): void },
    opts: EventListenerOptions,
    unregisterListenersCollection?: Function[]
  ): Function {
    // use event listener options when supported
    // otherwise it's just a boolean for the "capture" arg
    const listenerOpts: any = this._uiEvtOpts
      ? {
          capture: !!opts.capture,
          passive: !!opts.passive
        }
      : !!opts.capture

    let unReg: Function

    // use the native addEventListener
    ele['addEventListener'](eventName, callback, listenerOpts)

    unReg = function unregisterListener() {
      ele['removeEventListener'](eventName, callback, listenerOpts)
    }

    if (unregisterListenersCollection) {
      unregisterListenersCollection.push(unReg)
    }

    return unReg
  }

  /**
   * @hidden
   */
  windowLoad(callback: Function) {
    const win = this._win
    const doc = this._doc
    let unreg: Function

    /* istanbul ignore else */
    if (doc.readyState === 'complete') {
      callback(win, doc)
    } else {
      unreg = this.registerListener(
        win,
        'load',
        () => {
          unreg && unreg()
          callback(win, doc)
        },
        {}
      )
    }
  }

  // Platform Registry
  // **********************************************

  /**
   * @hidden
   */
  setPlatformConfigs(platformConfigs: PlatformConfigs) {
    this._registry = platformConfigs || {}
  }

  /**
   * @hidden
   */
  getPlatformConfig(platformName: string): PlatformConfig {
    return this._registry[platformName] || {}
  }

  /**
   * @hidden
   */
  registry() {
    return this._registry
  }

  /**
   * @hidden
   */
  setCore(platformName: string) {
    this._core = platformName
  }

  /**
   * @hidden
   * separate by ';'
   * @example core;ios;iphone -> ios
   */
  testQuery(queryValue: string, queryTestValue: string): boolean {
    const valueSplit = queryValue.toLowerCase().split(';')
    return valueSplit.indexOf(queryTestValue) > -1
  }

  /**
   * @hidden
   */
  testNavigatorPlatform(navigatorPlatformExpression: string): boolean {
    const rgx = new RegExp(navigatorPlatformExpression, 'i')
    return rgx.test(this._nPlt)
  }

  /**
   * @hidden
   */
  matchUserAgentVersion(userAgentExpression: RegExp): any {
    if (this._ua && userAgentExpression) {
      const val = this._ua.match(userAgentExpression)
      if (val) {
        return {
          major: val[1],
          minor: val[2],
          patch: val[3]
        }
      }
    }
  }

  testUserAgent(expression: string): boolean {
    if (this._ua) {
      const rgx = new RegExp(expression, 'i')
      return rgx.test(this._ua)
    }
    return false
  }

  /**
   * @hidden
   */
  isPlatformMatch(
    queryStringName: string,
    userAgentAtLeastHas?: string[],
    userAgentMustNotHave: string[] = []
  ): boolean {
    const queryValue = this.getQueryParam('platform')
    if (queryValue) {
      return this.testQuery(queryValue, queryStringName)
    }

    userAgentAtLeastHas = userAgentAtLeastHas || [queryStringName]

    for (let i = 0; i < userAgentAtLeastHas.length; i++) {
      if (this.testUserAgent(userAgentAtLeastHas[i])) {
        for (let j = 0; j < userAgentMustNotHave.length; j++) {
          if (this.testUserAgent(userAgentMustNotHave[j])) {
            return false
          }
        }
        return true
      }
    }

    return false
  }

  /* istanbul ignore next */
  /**
   * @hidden
   */
  loadScript(url: string, cb: Function) {
    const _head: HTMLHeadElement = this.doc().getElementsByTagName('head')[0]
    const _script: HTMLScriptElement = this.doc().createElement('script')
    const startTime = new Date().getTime()
    _script.setAttribute('type', 'text/javascript')
    _script.setAttribute('src', url)
    _head.appendChild(_script)
    _script.onload = function() {
      console.debug(`Script "${url}" loaded in ${new Date().getTime() - startTime}ms!`)
      /* istanbul ignore next */
      cb && cb.call(null)
    }
  }

  /* istanbul ignore next */
  /**
   * @hidden
   */
  loadJsSDK(sdkInfo: SDKInfo, successCallback: Function, errorCallback: Function): void {
    const { jsSDKUrl, jsSDKName, jsSDKEventName, timeout = 10000 } = sdkInfo

    if (!jsSDKName) {
      errorCallback(`Please input the name of JSSDK!`)
      return
    }
    if (!jsSDKUrl) {
      errorCallback(`JSSDK ${jsSDKName} loaded without jsSDKUrl params!`)
      return
    }
    if (!jsSDKEventName) {
      errorCallback(`JSSDK ${jsSDKName} loaded without jsSDKEventName params!`)
      return
    }

    const win: any = this.win()
    let timer = window.setTimeout(() => {
      errorCallback(`JSSDK ${jsSDKName} loaded timeout!`)
    }, timeout)

    if (win[jsSDKName] !== undefined) {
      successCallback(`JSSDK ${jsSDKName} already loaded!`)
      timer && window.clearTimeout(timer)
    } else {
      this.loadScript(jsSDKUrl, () => {
        function beforeBridgeReady() {
          // 解除绑定
          if (document.removeEventListener) {
            document.removeEventListener(jsSDKEventName, beforeBridgeReady)
          }

          successCallback(`JSSDK ${jsSDKName} loaded by JsSDKLoader!`)
          timer && window.clearTimeout(timer)
        }

        if (win[jsSDKName] === undefined) {
          if (document.addEventListener) {
            document.addEventListener(jsSDKEventName, beforeBridgeReady, false)
          }
        } else {
          beforeBridgeReady()
        }
      })
    }
  }

  /**
   * @hidden
   */
  init() {
    // 1. resize event init
    this._initEvents()

    let _platforms: { [key: string]: PlatformNode } = {}
    this._platforms = []
    this._versions = {}
    this._settings = {}

    for (let name in this._registry) {
      let _tmp: PlatformNode = new PlatformNode(this._registry, name)

      /* istanbul ignore if */
      if (_tmp.type === undefined) {
        console.warn('Each platform environment needs to pass in the specified "type" attribute')
      }

      if (_platforms[_tmp.type]) continue

      if (_tmp.isMatch(this)) {
        _platforms[_tmp.type] = _tmp
        _platforms[_tmp.type].name = name
      }
    }

    for (let name in _platforms) {
      // 2. this._platforms
      let _tmp: PlatformNode = _platforms[name]
      this._platforms.push(_tmp.name)

      // 3. this._versions
      const version = _tmp.version(this)
      if (version) {
        this._versions[_tmp.name] = version
      }

      // 4. reduce settings
      _tmp.reduceSettings(this._settings)

      // 5. initialize
      _tmp.initialize(this)
    }

    // when normal web
    if (Object.keys(_platforms).indexOf(`${Type.ENVIRONMENT}`) === -1) {
      this._platforms.push('web')
    }

    // 6. prepareReady
    this.prepareReady()
  }

  private _initEvents() {
    // Test via a getter in the options object to see if the passive property is accessed
    /* istanbul ignore next */
    const NOOP = function() {
      // empty
    }
    try {
      let opts = Object.defineProperty({}, 'passive', {
        get: /* istanbul ignore next */ () => {
          this._uiEvtOpts = true
        }
      })
      this._win.addEventListener('optsTest', NOOP, opts)
    } catch (e) {
      // empty
    }

    // add the window resize event listener XXms after
    /* istanbul ignore next */
    window.setTimeout(() => {
      let timerId: number
      this.registerListener(
        this._win,
        'resize',
        () => {
          window.clearTimeout(timerId)
          timerId = window.setTimeout(() => {
            this._isPortrait = null
            // TODO: resize
            // this.resize.emit();
          }, 200)
        },
        { passive: true }
      )
    }, 2000)
  }

  private _calcDim() {
    if (
      this._isPortrait === null ||
      (this._isPortrait === false && this._win['innerWidth'] < this._win['innerHeight'])
    ) {
      let win = this._win
      let innerWidth = win.screen.width
      let innerHeight = win.screen.height
      if (innerWidth > 0 && innerHeight > 0) {
        /* istanbul ignore next  */
        if (innerWidth < innerHeight) {
          this._isPortrait = true
          this._pW = innerWidth
          this._pH = innerHeight
        } else {
          // the device is in landscape
          this._isPortrait = false
          this._lW = innerWidth
          this._lH = innerHeight
        }
      }
    }
  }
}

/**
 * @name setupPlatform
 * @description
 * Setup platform with default platform configs.
 *
 * @param {PlatformConfigs} platformConfigs
 * @return {Platform}
 */
export function setupPlatform(platformConfigs: PlatformConfigs): Platform {
  const _finalConf = mergeConfigs(PLATFORM_CONFIGS, platformConfigs)
  return new Platform(_finalConf)
}
