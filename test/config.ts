import { Platform } from '../src/platform'

export interface Win extends Window {
  dd?: any
}

export default {
  wechat: {
    type: 4,
    initialize: function(plt: Platform) {
      plt.prepareReady = function() {
        const jsSDKUrl = '//res.wx.qq.com/open/js/jweixin-1.0.0.js'
        const jsSDKName = 'WeixinJSBridge'
        const jsSDKEventName = 'WeixinJSBridgeReady'
        plt.loadJsSDK(
          {
            jsSDKUrl: jsSDKUrl,
            jsSDKName: jsSDKName,
            jsSDKEventName: jsSDKEventName,
            timeout: 10000
          },
          function(successData: string) {
            console.debug(successData)
            plt.triggerReady('wechat')
          },
          function(errorData: string) {
            console.debug(errorData)
            plt.triggerFail('wechat') // to plt.ready()
          }
        )
      }
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function(plt: Platform) {
      return plt.isPlatformMatch('wechat', ['micromessenger'])
    },
    versionParser: function(plt: Platform) {
      return plt.matchUserAgentVersion(/micromessenger\/(\d+).(\d+).(\d+)?/i)
    }
  },
  alipay: {
    type: 4,
    initialize: function(plt: Platform) {
      // overwrite prepareReady function
      plt.prepareReady = function() {
        const jsSDKUrl = '//a.alipayobjects.com/g/h5-lib/alipayjsapi/3.0.2/alipayjsapi.min.js'
        const jsSDKName = 'AlipayJSBridge'
        const jsSDKEventName = 'AlipayJSBridgeReady'
        // check and load js sdk
        plt.loadJsSDK(
          {
            jsSDKUrl: jsSDKUrl,
            jsSDKName: jsSDKName,
            jsSDKEventName: jsSDKEventName,
            timeout: 100
          },
          function(successData: string) {
            console.debug(successData)
            plt.triggerReady('alipay') // to plt.ready()
          },
          function(errorData: string) {
            console.debug(errorData)
            plt.triggerFail('alipay') // to plt.ready()
          }
        )
      }
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function(plt: Platform) {
      return plt.isPlatformMatch('alipay', ['alipay', 'alipayclient'])
    },
    versionParser: function(plt: Platform) {
      return plt.matchUserAgentVersion(/alipayclient\/(\d+).(\d+).(\d+)?/i)
    }
  },
  dingtalk: {
    type: 4,
    initialize: function(plt: Platform) {
      plt.prepareReady = function() {
        const jsSDKUrl = '//g.alicdn.com/dingding/open-develop/1.6.9/dingtalk.js'
        let timer = window.setTimeout(function() {
          plt.triggerFail('dingtalk')
        }, 10000)

        plt.loadScript(jsSDKUrl, function() {
          const win: Win = window
          win.dd.ready(function() {
            plt.triggerReady('dingtalk')
            timer && window.clearTimeout(timer)
          })

          win.dd.error(function() {
            plt.triggerFail('dingtalk')
            timer && window.clearTimeout(timer)
          })
        })
      }
    },
    settings: {
      hideNavBar: true
    },
    isMatch: function(plt: Platform) {
      return plt.isPlatformMatch('dingtalk')
    },
    versionParser: function(plt: Platform) {
      return plt.matchUserAgentVersion(/dingtalk\/(\d+).(\d+).(\d+)?/i)
    }
  },
  nexus: {
    type: 3,
    isMatch: function(plt: Platform) {
      return plt.isPlatformMatch('nexus', ['nexus'])
    }
  }
}
