'use strict';

import {Platform} from '../platform';

export function isMobile(plt: Platform): boolean {
  return !isTablet(plt) && plt.isPlatformMatch('mobile', ['AppleWebKit.*Mobile.*']);
}

export function isTablet(plt: Platform): boolean {
  let smallest = Math.min(plt.width(), plt.height());
  let largest = Math.max(plt.width(), plt.height());
  const matchSize = (smallest > 460 && smallest < 1100) &&
    (largest > 780 && largest < 1400);

  const matchUa = plt.isPlatformMatch('ipad', ['ipad']);
  return matchSize && matchUa;
}

export function isDesktop(plt: Platform): boolean {
  return !isMobile(plt) && !isTablet(plt) && plt.testNavigatorPlatform('win|mac|x11|linux');
}

export function isMac(plt: Platform): boolean {
  return plt.testNavigatorPlatform('mac') && plt.isPlatformMatch('macintosh', ['macintosh']);
}

export function isWindows(plt: Platform): boolean {
  return plt.isPlatformMatch('windows', ['windows', 'microsoft', 'windows phone']) || plt.testNavigatorPlatform('win');
}

export function isLinux(plt: Platform): boolean {
  const matchUa = plt.isPlatformMatch('linux', ['linux', 'x11'], ['android']);
  const matchPlatform = plt.testNavigatorPlatform('x11|linux');
  return matchUa || matchPlatform;
}

export function isAndroid(plt: Platform): boolean {
  return plt.isPlatformMatch('android', ['android', 'silk'], ['windows phone']);
}

export function isCordova(plt: Platform): boolean {
  const win: any = plt.win();
  return !!(win['cordova'] || win['PhoneGap'] || win['phonegap']);
}

export function isElectron(plt: Platform): boolean {
  return plt.testUserAgent('Electron');
}

export function isIos(plt: Platform): boolean {
  const matchUa = plt.isPlatformMatch('ios', ['iphone', 'ipad', 'ipod'], ['windows phone']);
  // shortcut function to be reused internally
  // checks navigator.platform to see if it's an actual iOS device
  // this does not use the user-agent string because it is often spoofed
  // an actual iPad will return true, a chrome dev tools iPad will return false
  const matchPlatform = plt.testNavigatorPlatform('iphone|ipad|ipod');
  return matchUa || matchPlatform;
}

export function isSafari(plt: Platform): boolean {
  return plt.testUserAgent('Safari');
}

export function isWKWebView(plt: Platform): boolean {
  return isIos(plt) && !!(<any>plt.win())['webkit'];
}

export function isIosUIWebView(plt: Platform): boolean {
  return isIos(plt) && !isWKWebView(plt) && !isSafari(plt);
}

