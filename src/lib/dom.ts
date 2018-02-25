'use strict';

export function getCss(docEle: HTMLElement) {
  const css: {
    transform?: string;
    transition?: string;
    transitionDuration?: string;
    transitionDelay?: string;
    transitionTimingFn?: string;
    transitionStart?: string;
    transitionEnd?: string;
    transformOrigin?: string;
    animationDelay?: string;
  } = {};

  // transform
  let i: number;
  let keys = ['webkitTransform', '-webkit-transform', 'webkit-transform', 'transform'];

  for (i = 0; i < keys.length; i++) {
    if ((docEle.style as any)[keys[i]] !== undefined) {
      css.transform = keys[i];
      break;
    }
  }

  // transition
  keys = ['webkitTransition', 'transition'];
  for (i = 0; i < keys.length; i++) {
    if ((docEle.style as any)[keys[i]] !== undefined) {
      css.transition = keys[i];
      break;
    }
  }

  // The only prefix we care about is webkit for transitions.
  if (css.transition) {
    let isWebkit = css.transition.indexOf('webkit') > -1;

    // transition duration
    css.transitionDuration = (isWebkit ? '-webkit-' : '') + 'transition-duration';

    // transition timing function
    css.transitionTimingFn = (isWebkit ? '-webkit-' : '') + 'transition-timing-function';

    // transition delay
    css.transitionDelay = (isWebkit ? '-webkit-' : '') + 'transition-delay';

    // To be sure transitionend works everywhere, include *both* the webkit and non-webkit events
    css.transitionEnd = (isWebkit ? 'webkitTransitionEnd ' : '') + 'transitionend';

    // transform origin
    css.transformOrigin = (isWebkit ? '-webkit-' : '') + 'transform-origin';

    // animation delay
    css.animationDelay = (isWebkit ? 'webkitAnimationDelay' : 'animationDelay');
  }

  return css;
}

export function isTextInput(ele: any) {
  return !!ele &&
    (ele.tagName === 'TEXTAREA' ||
      ele.contentEditable === 'true' ||
      (ele.tagName === 'INPUT' && !(NON_TEXT_INPUT_REGEX.test(ele.type))));
}

export const NON_TEXT_INPUT_REGEX = /^(radio|checkbox|range|file|submit|reset|color|image|button)$/i;
