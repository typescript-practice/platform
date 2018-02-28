'use strict'

import { Platform } from '../platform'
import { PlatformConfig, Type } from './interface'
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
} from './platform-utils'

const PLATFORM_CONFIGS: { [key: string]: PlatformConfig } = {
  /**
   * core
   */
  core: {
    type: Type.BASE,
    settings: {
      mode: 'md'
    },
    isMatch() {
      return true
    }
  },

  mobile: {
    type: Type.PLATFORM,
    settings: {
      hoverCSS: false
    },
    isMatch(plt: Platform) {
      return isMobile(plt)
    }
  },

  /**
   * tablet: 平板电脑, pad
   */
  tablet: {
    type: Type.PLATFORM,
    settings: {
      hoverCSS: false
    },
    isMatch(plt: Platform) {
      return isTablet(plt)
    }
  },

  /**
   * desktop: 桌面
   */
  desktop: {
    type: Type.PLATFORM,
    settings: {
      hoverCSS: true
    },
    isMatch(plt: Platform) {
      return isDesktop(plt)
    }
  },

  /**
   * android
   */
  android: {
    type: Type.SYSTEM,
    settings: {
      mode: 'md',
      autoFocusAssist: 'immediate',
      tapPolyfill: true,
      scrollAssist: true
    },
    isMatch(plt: Platform) {
      return isAndroid(plt)
    },
    versionParser(plt: Platform) {
      return plt.matchUserAgentVersion(/Android (\d+).(\d+)?/)
    }
  },

  /**
   * ios
   */
  ios: {
    type: Type.SYSTEM,
    settings: {
      mode: 'ios',
      autoFocusAssist: 'delay',
      tapPolyfill: isIosUIWebView,
      scrollAssist: false
    },
    isMatch(plt: Platform) {
      return isIos(plt)
    },
    versionParser(plt: Platform) {
      return plt.matchUserAgentVersion(/OS (\d+)_(\d+)?/)
    }
  },

  /**
   * Desktop: Windows
   */
  windows: {
    type: Type.SYSTEM,
    settings: {
      mode: 'wp',
      autoFocusAssist: 'immediate'
    },
    isMatch(plt: Platform): boolean {
      return isWindows(plt)
    }
  },

  mac: {
    type: Type.SYSTEM,
    isMatch(plt: Platform): boolean {
      return isMac(plt)
    }
  },

  /**
   * for desktop
   */
  linux: {
    type: Type.SYSTEM,
    isMatch(plt: Platform): boolean {
      return isLinux(plt)
    }
  },

  /**
   * iphone
   */
  iphone: {
    type: Type.BRAND,
    isMatch(plt: Platform) {
      return plt.isPlatformMatch('iphone')
    }
  },

  /**
   * ipad
   */
  ipad: {
    type: Type.BRAND,
    settings: {
      keyboardHeight: 500
    },
    isMatch(plt: Platform) {
      return plt.isPlatformMatch('ipad')
    }
  },

  /**
   * cordova
   */
  cordova: {
    type: Type.ENVIRONMENT,
    initialize: /* istanbul ignore next */ function(plt: Platform) {
      // prepare a custom "ready" for cordova "deviceready"
      plt.prepareReady = function() {
        plt.windowLoad(function(win: Window, doc: HTMLDocument) {
          doc.addEventListener('deviceready', function() {
            // cordova has fully loaded and we've added listeners
            plt.triggerReady('cordova')
          })
        })
      }
    },
    isMatch(plt: Platform): boolean {
      return isCordova(plt)
    }
  },

  /**
   * electron
   */
  electron: {
    type: Type.ENVIRONMENT,
    initialize: /* istanbul ignore next */ function(plt: Platform) {
      plt.prepareReady = function() {
        plt.windowLoad(function() {
          plt.triggerReady('electron')
        })
      }
    },
    isMatch(plt: Platform): boolean {
      return isElectron(plt)
    }
  }
}

export default PLATFORM_CONFIGS
