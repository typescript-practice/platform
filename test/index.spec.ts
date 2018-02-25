/* eslint-disable no-undef,no-unused-expressions */
'use strict';
import {Platform, setupPlatform} from '../src/platform';

const config = {
  wechat: {
    type: 4,
    initialize: function (plt: Platform) {
      plt.prepareReady = function () {
        const jsSDKUrl = '//res.wx.qq.com/open/js/jweixin-1.0.0.js';
        const jsSDKName = 'WeixinJSBridge';
        const jsSDKEventName = 'WeixinJSBridgeReady';
        plt.loadJsSDK(
          {
            jsSDKUrl: jsSDKUrl,
            jsSDKName: jsSDKName,
            jsSDKEventName: jsSDKEventName,
            timeout: 10000
          },
          function (successData: string) {
            console.debug(successData);
            plt.triggerReady('wechat');
          },
          function (errorData: string) {
            console.debug(errorData);
            plt.triggerFail('wechat'); // to plt.ready()
          }
        );
      };
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function (plt: Platform) {
      return plt.isPlatformMatch('wechat', ['micromessenger']);
    },
    versionParser: function (plt: Platform) {
      return plt.matchUserAgentVersion(/micromessenger\/(\d+).(\d+).(\d+)?/i);
    }
  },
  alipay: {
    type: 4,
    initialize: function (plt: Platform) {
      // overwrite prepareReady function
      plt.prepareReady = function () {
        const jsSDKUrl = '//a.alipayobjects.com/g/h5-lib/alipayjsapi/3.0.2/alipayjsapi.min.js';
        const jsSDKName = 'AlipayJSBridge';
        const jsSDKEventName = 'AlipayJSBridgeReady';
        // check and load js sdk
        plt.loadJsSDK(
          {
            jsSDKUrl: jsSDKUrl,
            jsSDKName: jsSDKName,
            jsSDKEventName: jsSDKEventName,
            timeout: 100
          },
          function (successData: string) {
            console.debug(successData);
            plt.triggerReady('alipay'); // to plt.ready()
          },
          function (errorData: string) {
            console.debug(errorData);
            plt.triggerFail('alipay'); // to plt.ready()
          }
        );
      };
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function (plt: Platform) {
      return plt.isPlatformMatch('alipay', ['alipay', 'alipayclient']);
    },
    versionParser: function (plt: Platform) {
      return plt.matchUserAgentVersion(/alipayclient\/(\d+).(\d+).(\d+)?/i);
    }
  },
  dingtalk: {
    type: 4,
    initialize: function (plt: Platform) {
      plt.prepareReady = function () {
        const jsSDKUrl = '//g.alicdn.com/dingding/open-develop/1.6.9/dingtalk.js';
        let timer = window.setTimeout(function () {
          plt.triggerFail('dingtalk');
        }, 10000);

        plt.loadScript(jsSDKUrl, function () {
          // window.dd.ready(function () {
          //   plt.triggerReady('dingtalk');
          //   timer && window.clearTimeout(timer);
          // });
          //
          // window.dd.error(function () {
          //   plt.triggerFail('dingtalk');
          //   timer && window.clearTimeout(timer);
          // });
        });
      };
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function (plt: Platform) {
      return plt.isPlatformMatch('dingtalk');
    },
    versionParser: function (plt: Platform) {
      return plt.matchUserAgentVersion(/dingtalk\/(\d+).(\d+).(\d+)?/i);
    }
  },
  nexus: {
    type: 3,
    isMatch: function (plt: Platform) {
      return plt.isPlatformMatch('nexus', ['nexus']);
    }
  }
};


// alipay useragent
const MOCK_CONFIG = {
  useragent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 AlipayDefined(nt:WIFI,ws:360|640|1.5) AliApp(AP/9.0.1.073001) AlipayClient/9.0.1.073001   GCanvas/1.4.2.15'
};

describe('Test platform.js without mock config', function () {
  const plt = setupPlatform(config);
  it('is()', function () {
    expect(plt.is('core')).toBeTruthy();
  });

  it('ready()', function () {
    return plt.ready().then(function (data) {
      expect(data).toEqual('dom');
    });
  });

  it('platforms()', function () {
    expect(plt.platforms().toString()).toMatch('core');
  });

  // setCssProps()
  it('setCssProps()', function () {
    expect(plt.Css).toEqual({
      animationDelay: 'webkitAnimationDelay',
      transform: 'webkitTransform',
      transformOrigin: '-webkit-transform-origin',
      transition: 'webkitTransition',
      transitionDelay: '-webkit-transition-delay',
      transitionDuration: '-webkit-transition-duration',
      transitionEnd: 'webkitTransitionEnd transitionend',
      transitionTimingFn: '-webkit-transition-timing-function'
    });
  });
});

// describe('Test platform.js with mock config', function () {
//   const plt = setupPlatform(config);
//   plt.setUserAgent(MOCK_CONFIG.useragent)
//
//   it('is()', function () {
//     expect(plt.is('alipay')).toBeTruthy();
//   });
//
//   it('versions()', function () {
//     expect(JSON.stringify(plt.versions())).toEqual('{"ios":{"str":"10.2.0","num":10.2,"major":10,"minor":2,"patch":0},"alipay":{"str":"9.0.1","num":9,"major":9,"minor":0,"patch":1}}');
//   });
//
//   it('version()', function () {
//     expect(JSON.stringify(plt.version())).toEqual('{"str":"10.2.0","num":10.2,"major":10,"minor":2,"patch":0}');
//   });
//
//   it('platforms()', function () {
//     expect(plt.platforms().toString())
//       .toEqual('mobile,ios,alipay');
//   });
// });
