'use strict';

import {Platform} from '../platform';
import {PlatformConfig, Type} from './interface';
import {
  isAndroid,
  isCordova,
  isDesktop,
  isElectron,
  isIos,
  isIosUIWebView,
  isLinux,
  isMac,
  isMobile,
  isTablet,
  isWindows
} from './platform-utils';

export const PLATFORM_CONFIGS: { [key: string]: PlatformConfig } = {


  'mobile': {
    type: Type.PLATFORM,
    settings: {
      hoverCSS: false,
    },
    isMatch(plt: Platform) {
      return isMobile(plt);
    }
  },

  /**
   * tablet: 平板电脑, pad
   */
  'tablet': {
    type: Type.PLATFORM,
    settings: {
      hoverCSS: false,
    },
    isMatch(plt: Platform) {
      return isTablet(plt);
    }
  },

  /**
   * desktop: 桌面
   */
  'desktop': {
    type: Type.PLATFORM,
    settings: {
      hoverCSS: true,
    },
    isMatch(plt: Platform) {
      return isDesktop(plt);
    }
  },

  /**
   * android
   */
  'android': {
    type: Type.SYSTEM,
    settings: {
      autoFocusAssist: 'immediate',
      inputCloning: true,
      scrollAssist: true,
      keyboardHeight: 300,
      mode: 'md',
    },
    isMatch(plt: Platform) {
      return isAndroid(plt);
    },
    versionParser(plt: Platform) {
      return plt.matchUserAgentVersion(/Android (\d+).(\d+)?/);
    }
  },

  /**
   * ios
   */
  'ios': {
    type: Type.SYSTEM,
    settings: {
      autoFocusAssist: 'delay',
      hideCaretOnScroll: true,
      inputBlurring: isIos,
      inputCloning: isIos,
      keyboardHeight: 250,
      mode: 'ios',
      statusbarPadding: isCordova,
      swipeBackEnabled: isIos,
      tapPolyfill: isIosUIWebView,
      virtualScrollEventAssist: isIosUIWebView,
      disableScrollAssist: isIos,
      scrollAssist: isIos,
    },
    isMatch(plt: Platform) {
      return isIos(plt);
    },
    versionParser(plt: Platform) {
      return plt.matchUserAgentVersion(/OS (\d+)_(\d+)?/);
    }
  },

  /**
   * Desktop: Windows
   */
  'windows': {
    type: Type.SYSTEM,
    settings: {
      mode: 'wp',
      autoFocusAssist: 'immediate',
      hoverCSS: false
    },
    isMatch(plt: Platform): boolean {
      return isWindows(plt);
    },
    versionParser(plt: Platform): any {
      // TODO: no win mobile drive
      return plt.matchUserAgentVersion(/Windows Phone (\d+).(\d+)?/);
    }
  },

  'mac': {
    type: Type.SYSTEM,
    isMatch(plt: Platform): boolean {
      return isMac(plt);
    },
  },

  'linux': {
    type: Type.SYSTEM,
    isMatch(plt: Platform): boolean {
      return isLinux(plt);
    },
  },

  /**
   * iphone
   */
  'iphone': {
    type: Type.BRAND,
    isMatch(plt: Platform) {
      return plt.isPlatformMatch('iphone');
    }
  },

  /**
   * ipad
   */
  'ipad': {
    type: Type.BRAND,
    settings: {
      keyboardHeight: 500,
    },
    isMatch(plt: Platform) {
      return plt.isPlatformMatch('ipad');
    }
  },

  /**
   * cordova
   */
  'cordova': {
    type: Type.ENVIRONMENT,
    initialize: function (plt: Platform) {
      // prepare a custom "ready" for cordova "deviceready"
      plt.prepareReady = function () {
        // 1) ionic bootstrapped
        plt.windowLoad(function (win: Window, doc: HTMLDocument) {
          // 2) window onload triggered or completed
          doc.addEventListener('deviceready', function () {
            // 3) cordova deviceready event triggered

            // add cordova listeners to emit platform events
            doc.addEventListener('backbutton', function (ev: Event) {
              // TODO: backButton
              // plt.backButton.emit(ev);
            });
            doc.addEventListener('pause', function (ev: Event) {
              // TODO: pause
              // plt.pause.emit(ev);
            });
            doc.addEventListener('resume', function (ev: Event) {
              // TODO: resume
              // plt.resume.emit(ev);
            });

            // cordova has its own exitApp method
            plt.exitApp = function () {
              // (<any>win)['navigator']['app'].exitApp();
            };

            // cordova has fully loaded and we've added listeners
            plt.triggerReady('cordova');
          });
        });
      };
    },
    isMatch(plt: Platform): boolean {
      return isCordova(plt);
    }
  },

  /**
   * electron
   */
  'electron': {
    type: Type.ENVIRONMENT,
    initialize: function (plt: Platform) {
      plt.prepareReady = function () {
        // 1) ionic bootstrapped
        plt.windowLoad(function () {
          plt.triggerReady('electron');
        });
      };
    },
    isMatch(plt: Platform): boolean {
      return isElectron(plt);
    }
  },

  'wechat': {
    type: Type.ENVIRONMENT,
    initialize: function (plt: Platform) {
      plt.prepareReady = function () {
        // 1) ionic bootstrapped
        plt.windowLoad(function () {
          plt.triggerReady('wechat');
        });
      };
    },
    settings: {
      jsSDKUrl: '//res.wx.qq.com/open/js/jweixin-1.0.0.js',
      hideNavBar: true
    },
    isMatch(plt: Platform) {
      return plt.isPlatformMatch('wechat', ['micromessenger']);
    },
    versionParser(plt: Platform) {
      return plt.matchUserAgentVersion(/micromessenger\/(\d+).(\d+).(\d+)?/i);
    }
  },

  'alipay': {
    type: Type.ENVIRONMENT,
    initialize: function (plt: Platform) {
      plt.prepareReady = function () {
        const jsSDKUrl = '//a.alipayobjects.com/g/h5-lib/alipayjsapi/3.0.2/alipayjsapi.min.js';
        const jsSDKName = 'AlipayJSBridge';
        const jsSDKEventName = 'AlipayJSBridgeReady';
        plt.loadJsSDK({jsSDKUrl, jsSDKName, jsSDKEventName, timeout: 100}, function (successData: any) {
          console.debug(successData);
        }, function (erorData: any) {
          console.debug(erorData);
        });
      };
    },
    settings: {
      usePushWindow: false, // 页面切换使用alipay提供的 pushWindow() 方法开启新页面
      hideNavBar: true
    },
    isMatch(plt: Platform) {
      return plt.isPlatformMatch('alipay', ['alipay', 'alipayclient']);
    },
    versionParser(plt: Platform) {
      return plt.matchUserAgentVersion(/alipayclient\/(\d+).(\d+).(\d+)?/i);
    },
  },

  /**
   * core
   */
  'core': {
    type: Type.BASE,
    settings: {
      mode: 'md',
      keyboardHeight: 290
    },
    isMatch() {
      return true;
    }
  },
};
