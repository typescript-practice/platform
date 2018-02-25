'use strict';

import {getCss, isTextInput} from './lib/dom';
import {QueryParams} from './lib/query-params';
import {PLATFORM_CONFIGS} from './lib/platform-registry';
import {
  BackButtonAction,
  DocumentDirection,
  EventListenerOptions,
  PlatformConfig,
  PlatformVersion,
  SDKInfo,
  Type,
} from './lib/interface';

/**
 * @name Platform
 * @description
 * The Platform service can be used to get information about your current device.
 * You can get all of the platforms associated with the device using the [platforms](#platforms)
 * method, including whether the app is being viewed from a tablet, if it's
 * on a mobile device or browser, and the exact platform (iOS, Android, etc).
 * You can also get the orientation of the device, if it uses right-to-left
 * language direction, and much much more. With this information you can completely
 * customize your app to fit any device.
 *
 * @usage
 * ```ts
 * import Platform from 'tp-platform';
 *
 * const platform = new Platform();
 *
 * ```
 */
export class Platform {

  private _win: Window;
  private _doc: HTMLDocument;
  private _versions: { [name: string]: PlatformVersion } = {};
  private _dir: DocumentDirection;
  private _lang: string = '';
  private _ua: string = '';
  private _qp = new QueryParams(); // init settings
  private _nPlt: string = '';
  private _readyPromise: Promise<any>;
  private _readyResolve: any;
  private _readyReject: any;
  private _bbActions: BackButtonAction[] = [];
  private _registry: { [name: string]: PlatformConfig } = {};
  private _default: string;
  private _pW = 0;
  private _pH = 0;
  private _lW = 0;
  private _lH = 0;
  private _isPortrait: boolean | null = null;
  private _uiEvtOpts = false;

  /** @internal */
  Css: {
    transform?: string;
    transition?: string;
    transitionDuration?: string;
    transitionDelay?: string;
    transitionTimingFn?: string;
    transitionStart?: string;
    transitionEnd?: string;
    transformOrigin?: string;
    animationDelay?: string;
  };

  /** @internal */
  _platforms: string[] = [];
  _settings: any = {};

  constructor(platformConfigs: { [key: string]: PlatformConfig }) {

    const doc = document;
    const win = doc.defaultView; // read-only
    const docElement = doc.documentElement;
    const dir = docElement.dir;
    const platform = win.navigator.platform;
    const userAgent = win.navigator.userAgent;

    this._default = 'core';
    this._registry = platformConfigs || {}; // all platform configs

    // set values from "document"
    this._doc = doc;
    this._dir = dir === 'rtl' ? 'rtl' : 'ltr';
    this.isRTL = (dir === 'rtl');
    this.setLang(docElement.lang, false);

    // set css properties
    this.Css = getCss(docElement);

    // set values from "window"
    this._win = win;
    this.setNavigatorPlatform(platform);
    this.setUserAgent(userAgent);

    // set location values
    this.setQueryParams(win.location.href);

    // ready promise
    this._readyPromise = new Promise((res, rej) => {
      this._readyResolve = res;
      this._readyReject = rej;
    });

    // TODO: back button
    // this.backButton.subscribe(() => {
    //   // the hardware back button event has been fired
    //   console.debug('hardware back button');
    //
    //   // decide which backbutton action should run
    //   this.runBackButtonAction();
    // });

    this.init();
  }

  /**
   * @hidden
   */
  setWindow(win: Window) {
    this._win = win;
  }

  /**
   * @hidden
   */
  win() {
    return this._win;
  }

  /**
   * @hidden
   */
  setDocument(doc: HTMLDocument) {
    this._doc = doc;
  }

  /**
   * @hidden
   */
  doc() {
    return this._doc;
  }

  /**
   * @hidden
   */
  setCssProps(docElement: HTMLElement) {
    this.Css = getCss(docElement);
  }

  settings(): any {
    return this._settings;
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
   * from a web browser on the iPad then `mobileweb` would be `true`.
   *
   * ```
   * import { Platform } from 'ionic-angular';
   *
   * @Component({...})
   * export MyPage {
   *   constructor(public platform: Platform) {
   *     if (this.platform.is('ios')) {
   *       // This will only print when on iOS
   *       console.log('I am an iOS device!');
   *     }
   *   }
   * }
   * ```
   *
   * | Platform Name   | Description                        |
   * |-----------------|------------------------------------|
   * | android         | on a device running Android.       |
   * | cordova         | on a device running Cordova.       |
   * | core            | on a desktop device.               |
   * | ios             | on a device running iOS.           |
   * | ipad            | on an iPad device.                 |
   * | iphone          | on an iPhone device.               |
   * | mobile          | on a mobile device.                |
   * | tablet          | on a tablet device.                |
   * | windows         | on a device running Windows.       |
   *
   * @param {string} platformName
   */
  is(platformName: string): boolean {
    return (this._platforms.indexOf(platformName) > -1);
  }

  /**
   * @returns {array} the array of platforms
   * @description
   * Depending on what device you are on, `platforms` can return multiple values.
   * Each possible value is a hierarchy of platforms. For example, on an iPhone,
   * it would return `mobile`, `ios`, and `iphone`.
   *
   * ```
   * import { Platform } from 'ionic-angular';
   *
   * @Component({...})
   * export MyPage {
   *   constructor(public platform: Platform) {
   *     // This will print an array of the current platforms
   *     console.log(this.platform.platforms());
   *   }
   * }
   * ```
   */
  platforms(): Array<string> {
    // get the array of active platforms, which also knows the hierarchy,
    // with the last one the most important
    return this._platforms;
  }


  /**
   * Returns an object containing version information about all of the platforms.
   *
   * ```
   * import { Platform } from 'ionic-angular';
   *
   * @Component({...})
   * export MyPage {
   *   constructor(public platform: Platform) {
   *     // This will print an object containing
   *     // all of the platforms and their versions
   *     console.log(platform.versions());
   *   }
   * }
   * ```
   *
   * @returns {object} An object containing all of the platforms and their versions.
   */
  versions(): { [name: string]: PlatformVersion } {
    // get all the platforms that have a valid parsed version
    return this._versions;
  }

  // /**
  //  * @hidden
  //  */
  // version(): PlatformVersion {
  //   for (var platformName in this._versions) {
  //     if (this._versions[platformName]) {
  //       return this._versions[platformName];
  //     }
  //   }
  //   return {};
  // }

  /**
   * Returns a promise when the platform is ready and native functionality
   * can be called. If the app is running from within a web browser, then
   * the promise will resolve when the DOM is ready. When the app is running
   * from an application engine such as Cordova, then the promise will
   * resolve when Cordova triggers the `deviceready` event.
   *
   * The resolved value is the `readySource`, which states which platform
   * ready was used. For example, when Cordova is ready, the resolved ready
   * source is `cordova`. The default ready source value will be `dom`. The
   * `readySource` is useful if different logic should run depending on the
   * platform the app is running from. For example, only Cordova can execute
   * the status bar plugin, so the web should not run status bar plugin logic.
   *
   * ```
   * import { Component } from '@angular/core';
   * import { Platform } from 'ionic-angular';
   *
   * @Component({...})
   * export MyApp {
   *   constructor(public platform: Platform) {
   *     this.platform.ready().then((readySource) => {
   *       console.log('Platform ready from', readySource);
   *       // Platform now ready, execute any required native code
   *     });
   *   }
   * }
   * ```
   * @returns {promise}
   */
  ready(): Promise<string> {
    return this._readyPromise;
  }

  /**
   * @hidden
   * This should be triggered by the engine when the platform is
   * ready. If there was no custom prepareReady method from the engine,
   * such as Cordova or Electron, then it uses the default DOM ready.
   */
  triggerReady(readySource: string) {
    this._readyResolve(readySource);
  }

  triggerFail(readySource: string) {
    this._readyReject(readySource);
  }

  /**
   * @hidden
   * This is the default prepareReady if it's not replaced by an engine,
   * such as Cordova or Electron. If there was no custom prepareReady
   * method from an engine then it uses the method below, which triggers
   * the platform ready on the DOM ready event, and the default resolved
   * value is `dom`.
   */
  prepareReady() {
    const self = this;

    if (self._doc.readyState === 'complete' || self._doc.readyState === 'interactive') {
      self.triggerReady('dom');

    } else {
      self._doc.addEventListener('DOMContentLoaded', completed, false);
      self._win.addEventListener('load', completed, false);
    }

    function completed() {
      self._doc.removeEventListener('DOMContentLoaded', completed, false);
      self._win.removeEventListener('load', completed, false);
      self.triggerReady('dom');
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
    this._dir = dir;
    this.isRTL = (dir === 'rtl');

    if (updateDocument !== false) {
      this._doc['documentElement'].setAttribute('dir', dir);
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
    return this._dir;
  }

  /**
   * Returns if this app is using right-to-left language direction or not.
   * We recommend the app's `index.html` file already has the correct `dir`
   * attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
   * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
   * @returns {boolean}
   */
  isRTL: boolean;

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
    this._lang = language;
    if (updateDocument !== false) {
      this._doc['documentElement'].setAttribute('lang', language);
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
    return this._lang;
  }

  // Methods meant to be overridden by the engine
  // **********************************************
  // Provided NOOP methods so they do not error when
  // called by engines (the browser)that do not provide them

  /**
   * @hidden
   */
  exitApp() {
  }

  // Events meant to be triggered by the engine
  // **********************************************

  // TODO: Provide || Write EventEmitter Lib
  /**
   * @hidden
   */
  // backButton: EventEmitter<Event> = new EventEmitter<Event>();

  /**
   * The pause event emits when the native platform puts the application
   * into the background, typically when the user switches to a different
   * application. This event would emit when a Cordova app is put into
   * the background, however, it would not fire on a standard web browser.
   */
  // pause: EventEmitter<Event> = new EventEmitter<Event>();

  /**
   * The resume event emits when the native platform pulls the application
   * out from the background. This event would emit when a Cordova app comes
   * out from the background, however, it would not fire on a standard web browser.
   */
  // resume: EventEmitter<Event> = new EventEmitter<Event>();

  /**
   * The resize event emits when the browser window has changed dimensions. This
   * could be from a browser window being physically resized, or from a device
   * changing orientation.
   */

  // resize: EventEmitter<Event> = new EventEmitter<Event>();

  /**
   * The back button event is triggered when the user presses the native
   * platform's back button, also referred to as the "hardware" back button.
   * This event is only used within Cordova apps running on Android and
   * Windows platforms. This event is not fired on iOS since iOS doesn't come
   * with a hardware back button in the same sense an Android or Windows device
   * does.
   *
   * Registering a hardware back button action and setting a priority allows
   * apps to control which action should be called when the hardware back
   * button is pressed. This method decides which of the registered back button
   * actions has the highest priority and should be called.
   *
   * @param {Function} fn Called when the back button is pressed,
   * if this registered action has the highest priority.
   * @param {number} priority Set the priority for this action. Only the highest priority will execute. Defaults to `0`.
   * @returns {Function} A function that, when called, will unregister
   * the back button action.
   */
  registerBackButtonAction(fn: Function, priority: number = 0): Function {
    const action: BackButtonAction = {fn, priority};

    this._bbActions.push(action);

    // return a function to unregister this back button action
    return () => {
      // removeArrayItem(this._bbActions, action);
    };
  }

  /**
   * @hidden
   */
  runBackButtonAction() {
    // decide which one back button action should run
    let winner: any;
    this._bbActions.forEach((action: BackButtonAction) => {
      if (!winner || action.priority >= winner.priority) {
        winner = action;
      }
    });

    // run the winning action if there is one
    winner && winner.fn && winner.fn();
  }


  // Getter/Setter Methods
  // **********************************************

  /**
   * @hidden
   */
  setUserAgent(userAgent: string) {
    this._ua = userAgent;
  }

  /**
   * @hidden
   */
  setQueryParams(url: string) {
    this._qp.parseUrl(url);
  }

  /**
   * Get the query string parameter
   */
  getQueryParam(key: string) {
    return this._qp.get(key);
  }

  /**
   * Get the current url.
   */
  url() {
    return this._win['location']['href'];
  }

  /**
   * @hidden
   */
  userAgent(): string {
    return this._ua || '';
  }

  /**
   * @hidden
   */
  setNavigatorPlatform(navigatorPlt: string) {
    this._nPlt = navigatorPlt;
  }

  /**
   * @hidden
   */
  navigatorPlatform(): string {
    return this._nPlt || '';
  }

  /**
   * Gets the width of the platform's viewport using `window.innerWidth`.
   * Using this method is preferred since the dimension is a cached value,
   * which reduces the chance of multiple and expensive DOM reads.
   */
  width(): number {
    this._calcDim();
    return this._isPortrait ? this._pW : this._lW;
  }

  /**
   * Gets the height of the platform's viewport using `window.innerHeight`.
   * Using this method is preferred since the dimension is a cached value,
   * which reduces the chance of multiple and expensive DOM reads.
   */
  height(): number {
    this._calcDim();
    return this._isPortrait ? this._pH : this._lH;
  }

  /**
   * @hidden
   */
  getElementComputedStyle(ele: HTMLElement, pseudoEle?: string) {
    return this._win['getComputedStyle'](ele, pseudoEle);
  }

  /**
   * @hidden
   */
  getElementFromPoint(x: number, y: number) {
    return <HTMLElement>this._doc['elementFromPoint'](x, y);
  }

  /**
   * @hidden
   */
  getElementBoundingClientRect(ele: HTMLElement) {
    return ele['getBoundingClientRect']();
  }

  /**
   * Returns `true` if the app is in portait mode.
   */
  isPortrait(): boolean | null {
    this._calcDim();
    return this._isPortrait;
  }

  /**
   * Returns `true` if the app is in landscape mode.
   */
  isLandscape(): boolean {
    return !this.isPortrait();
  }

  private _calcDim() {
    // we're caching window dimensions so that
    // we're not forcing many layouts
    // if _isPortrait is null then that means
    // the dimensions needs to be looked up again
    // this also has to cover an edge case that only
    // happens on iOS 10 (not other versions of iOS)
    // where window.innerWidth is always bigger than
    // window.innerHeight when it is first measured,
    // even when the device is in portrait but
    // the second time it is measured it is correct.
    // Hopefully this check will not be needed in the future
    if (this._isPortrait === null || this._isPortrait === false && this._win['innerWidth'] < this._win['innerHeight']) {
      var win = this._win;

      // var innerWidth = win['innerWidth'];
      var innerWidth = win.screen.width;
      // var innerHeight = win['innerHeight'];
      var innerHeight = win.screen.height;

      // we're keeping track of portrait and landscape dimensions
      // separately because the virtual keyboard can really mess
      // up accurate values when the keyboard is up
      if (win.screen.width > 0 && win.screen.height > 0) {
        if (innerWidth < innerHeight) {

          // the device is in portrait
          // we have to do fancier checking here
          // because of the virtual keyboard resizing
          // the window
          if (this._pW <= innerWidth) {
            console.debug('setting _isPortrait to true');
            this._isPortrait = true;
            this._pW = innerWidth;
          }

          if (this._pH <= innerHeight) {
            console.debug('setting _isPortrait to true');
            this._isPortrait = true;
            this._pH = innerHeight;
          }

        } else {
          // the device is in landscape
          if (this._lW !== innerWidth) {
            console.debug('setting _isPortrait to false');
            this._isPortrait = false;
            this._lW = innerWidth;
          }

          if (this._lH !== innerHeight) {
            console.debug('setting _isPortrait to false');
            this._isPortrait = false;
            this._lH = innerHeight;
          }
        }

      }
    }
  }

  /**
   * @hidden
   * Built to use modern event listener options, like "passive".
   * If options are not supported, then just return a boolean which
   * represents "capture". Returns a method to remove the listener.
   */
  registerListener(ele: any, eventName: string, callback: { (ev?: UIEvent): void }, opts: EventListenerOptions, unregisterListenersCollection?: Function[]): Function {
    // use event listener options when supported
    // otherwise it's just a boolean for the "capture" arg
    const listenerOpts: any = this._uiEvtOpts ? {
      'capture': !!opts.capture,
      'passive': !!opts.passive,
    } : !!opts.capture;

    let unReg: Function;

    // use the native addEventListener, which is wrapped with zone
    ele['addEventListener'](eventName, callback, listenerOpts);

    unReg = function unregisterListener() {
      ele['removeEventListener'](eventName, callback, listenerOpts);
    };

    if (unregisterListenersCollection) {
      unregisterListenersCollection.push(unReg);
    }

    return unReg;
  }

  /**
   * @hidden
   */
  transitionEnd(el: HTMLElement, callback: { (ev?: TransitionEvent): void }, zone = true) {
    const unRegs: Function[] = [];

    function unregister() {
      unRegs.forEach(unReg => {
        unReg();
      });
    }

    function onTransitionEnd(ev: TransitionEvent) {
      if (el === ev.target) {
        unregister();
        callback(ev);
      }
    }

    if (el) {
      this.registerListener(el, 'webkitTransitionEnd', <any>onTransitionEnd, {}, unRegs);
      this.registerListener(el, 'transitionend', <any>onTransitionEnd, {}, unRegs);
    }

    return unregister;
  }

  /**
   * @hidden
   */
  windowLoad(callback: Function) {
    const win = this._win;
    const doc = this._doc;
    let unreg: Function;

    if (doc.readyState === 'complete') {
      callback(win, doc);
    } else {
      unreg = this.registerListener(win, 'load', () => {
        unreg && unreg();
        callback(win, doc);
      }, {});
    }
  }

  /**
   * @hidden
   */
  isActiveElement(ele: HTMLElement) {
    return !!(ele && (this.getActiveElement() === ele));
  }

  /**
   * @hidden
   */
  getActiveElement() {
    return this._doc['activeElement'];
  }

  /**
   * @hidden
   */
  hasFocus(ele: HTMLElement) {
    return !!((ele && (this.getActiveElement() === ele)) && ele.parentElement && (ele.parentElement.querySelector(':focus') === ele));
  }

  /**
   * @hidden
   */
  hasFocusedTextInput() {
    const ele = this.getActiveElement();
    if (ele && ele.parentElement && isTextInput(ele)) {
      return (ele.parentElement.querySelector(':focus') === ele);
    }
    return false;
  }

  /**
   * @hidden
   */
  focusOutActiveElement() {
    const activeElement: any = this.getActiveElement();
    activeElement && activeElement.blur && activeElement.blur();
  }

  private _initEvents() {
    // Test via a getter in the options object to see if the passive property is accessed
    const NOOP = function () {
    };
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: () => {
          this._uiEvtOpts = true;
        }
      });
      this._win.addEventListener('optsTest', NOOP, opts);
    } catch (e) {
    }

    // add the window resize event listener XXms after
    window.setTimeout(() => {
      var timerId: number;
      this.registerListener(this._win, 'resize', () => {
        window.clearTimeout(timerId);
        timerId = window.setTimeout(() => {
          // setting _isPortrait to null means the
          // dimensions will need to be looked up again
          if (this.hasFocusedTextInput() === false) {
            this._isPortrait = null;
          }
          // TODO: resize
          // this.resize.emit();
        }, 200);
      }, {passive: true});
    }, 2000);
  }


  // Platform Registry
  // **********************************************

  /**
   * @hidden
   */
  setPlatformConfigs(platformConfigs: { [key: string]: PlatformConfig }) {
    this._registry = platformConfigs || {};
  }

  /**
   * @hidden
   */
  getPlatformConfig(platformName: string): PlatformConfig {
    return this._registry[platformName] || {};
  }

  /**
   * @hidden
   */
  registry() {
    return this._registry;
  }

  /**
   * @hidden
   */
  setDefault(platformName: string) {
    this._default = platformName;
  }

  /**
   * @hidden
   * separate by ';'
   * @example core;ios;iphone -> ios
   */
  testQuery(queryValue: string, queryTestValue: string): boolean {
    const valueSplit = queryValue.toLowerCase().split(';');
    return valueSplit.indexOf(queryTestValue) > -1;
  }

  /**
   * @hidden
   */
  testNavigatorPlatform(navigatorPlatformExpression: string): boolean {
    const rgx = new RegExp(navigatorPlatformExpression, 'i');
    return rgx.test(this._nPlt);
  }

  /**
   * @hidden
   */
  matchUserAgentVersion(userAgentExpression: RegExp): any {
    if (this._ua && userAgentExpression) {
      const val = this._ua.match(userAgentExpression);
      if (val) {
        return {
          major: val[1],
          minor: val[2],
          patch: val[3],
        };
      }
    }
  }

  testUserAgent(expression: string): boolean {
    if (this._ua) {
      return this._ua.indexOf(expression) >= 0;
    }
    return false;
  }

  /**
   * @hidden
   */
  isPlatformMatch(queryStringName: string, userAgentAtLeastHas?: (string | RegExp)[], userAgentMustNotHave: string[] = []): boolean {
    const queryValue = this._qp.get('platform');
    if (queryValue) {
      return this.testQuery(queryValue, queryStringName);
    }

    userAgentAtLeastHas = userAgentAtLeastHas || [queryStringName];

    const userAgent = this._ua.toLowerCase();
    for (var i = 0; i < userAgentAtLeastHas.length; i++) {
      if (!!userAgent.match(userAgentAtLeastHas[i])) {
        for (var j = 0; j < userAgentMustNotHave.length; j++) {
          if (!!userAgent.match(userAgentMustNotHave[j])) {
            return false;
          }
        }
        return true;
      }
    }

    return false;
  }

  /**
   * @hidden
   */
  loadScript(url: string, cb: Function) {
    let _head: HTMLHeadElement = document.getElementsByTagName('head')[0];
    let _script: HTMLScriptElement = document.createElement('script');
    _script.setAttribute('type', 'text/javascript');
    _script.setAttribute('src', url);
    _head.appendChild(_script);
    _script.onload = function () {
      /* istanbul ignore next */
      cb && cb.call(null);
    };
  }

  /**
   * @hidden
   */
  loadJsSDK(sdkInfo: SDKInfo, successCallback: Function, errorCallback: Function): void {
    const {jsSDKUrl, jsSDKName, jsSDKEventName, timeout = 10000} = sdkInfo;
    let startTime = new Date().getTime();

    if (!jsSDKName) {
      errorCallback(`Please input the name of JSSDK!`);
      return;
    }
    if (!jsSDKUrl) {
      errorCallback(`JSSDK ${jsSDKName} loaded without jsSDKUrl params!`);
      return;
    }
    if (!jsSDKEventName) {
      errorCallback(`JSSDK ${jsSDKName} loaded without jsSDKEventName params!`);
      return;
    }

    const win: any = this.win();
    let timer = window.setTimeout(() => {
      errorCallback(`JSSDK ${jsSDKName} loaded timeout!`);
    }, timeout);

    if (win[jsSDKName] !== undefined) {
      successCallback(`JSSDK ${jsSDKName} already loaded!`);
      timer && window.clearTimeout(timer);
    } else {
      this.loadScript(jsSDKUrl, () => {
        function beforeBridgeReady() {
          // 解除绑定
          if (document.removeEventListener) {
            document.removeEventListener(jsSDKEventName, beforeBridgeReady);
          }

          successCallback(`JSSDK ${jsSDKName} loaded by JsSDKLoader in ${new Date().getTime() - startTime}ms!`);
          timer && window.clearTimeout(timer);
        }

        if (win[jsSDKName] === undefined) {
          if (document.addEventListener) {
            document.addEventListener(jsSDKEventName, beforeBridgeReady, false);
          }
        } else {
          beforeBridgeReady();
        }
      });
    }
  }

  /** @hidden */
  init() {
    // 1. resize event init
    this._initEvents();

    var _platforms: { [key: string]: PlatformNode } = {};

    for (let name in this._registry) {
      let _tmp: PlatformNode = new PlatformNode(this._registry, name);

      if (_tmp.type !== undefined) {
        console.warn('Each platform environment needs to pass in the specified "type" attribute');
      }

      if (!!_platforms[_tmp.type]) continue;

      if (_tmp.isMatch(this)) {
        _platforms[_tmp.type] = _tmp;
        _platforms[_tmp.type].name = name;
      }
    }

    for (let name in _platforms) {
      // 2. this._platforms
      let _tmp: PlatformNode = _platforms[name];
      this._platforms.push(_tmp.name);

      // 3. this._versions
      const version = _tmp.version(this);
      if (version) {
        this._versions[_tmp.name] = version;
      }

      // 4. reduce settings
      _tmp.reduceSettings(this._settings);

      // 5. initialize
      _tmp.initialize(this);
    }

    // 6. prepareReady
    this.prepareReady();
  }
}

/**
 * @hidden
 */
class PlatformNode {
  private c: PlatformConfig;

  name: string = '';
  type: Type = 0;

  constructor(registry: { [name: string]: PlatformConfig }, platformName: string) {
    this.c = registry[platformName];
    this.name = platformName;
    this.type = this.c.type;
  }

  reduceSettings(totalSettings: any): any {
    return Object.assign(totalSettings, this.settings());
  }

  settings() {
    return this.c.settings || {};
  }

  isMatch(p: Platform): boolean {
    return this.c.isMatch && this.c.isMatch(p) || false;
  }

  initialize(plt: Platform) {
    this.c.initialize && this.c.initialize(plt);
  }

  version(plt: Platform): PlatformVersion | null {
    if (this.c.versionParser) {
      const v = this.c.versionParser(plt);
      if (v) {
        if (!v.major) v.major = '0';
        if (!v.minor) v.minor = '0';
        if (!v.patch) v.patch = '0';
        const str = v.major + '.' + v.minor + (v.patch ? '.' + v.patch : '');
        return {
          str: str,
          num: parseFloat(str),
          major: parseInt(v.major, 10),
          minor: parseInt(v.minor, 10),
          patch: parseInt(v.patch, 10),
        };
      }
    }
    return null;
  }
}

/**
 * Merge Parameters
 * 1. 先进行参数合并, 自定义参数优先级高于默认配置, 比如: core中的配置, 自定义优先级高于默认
 * 2. 之后进行平台匹配, 匹配到的 platforms 越后面的平台参数优先级越高, 比如: core < mobile < ios < iphone < cordova
 * @hidden
 */
function mergeConfigs(defaultConfigs: any, customerConfig: any) {
  let _finalConf = defaultConfigs;

  const isObject = (val: any) => typeof val === 'object';
  const isPlainObject = (val: any) => isObject(val) && Object.getPrototypeOf(val) === Object.prototype;

  for (let outerKey in customerConfig) {
    if (_finalConf[outerKey] && isObject(_finalConf[outerKey])) {
      let _cusConf: any = customerConfig[outerKey];
      let _defConf: any = _finalConf[outerKey];
      for (let innerKey in _cusConf) {
        if (isPlainObject(_cusConf[innerKey]) && isPlainObject(_defConf[innerKey])) {
          Object.assign(_defConf[innerKey], _cusConf[innerKey]);
        } else {
          _defConf[innerKey] = _cusConf[innerKey];
        }
      }
    } else {
      _finalConf[outerKey] = customerConfig[outerKey];
    }
  }

  return _finalConf;
}

/**
 * @hidden
 */
export function setupPlatform(platformConfigs: { [key: string]: PlatformConfig }): Platform {
  let _finalConf = mergeConfigs(PLATFORM_CONFIGS, platformConfigs);

  console.log('_finalConf');
  console.log(_finalConf);

  const plt = new Platform(_finalConf);

  return plt;
}
