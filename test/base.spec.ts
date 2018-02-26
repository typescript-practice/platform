/* eslint-disable no-undef,no-unused-expressions */
'use strict'
import { setupPlatform } from '../src/platform'
import config from './config'
import mergeConfigs from '../src/lib/merge-configs'
import PLATFORM_CONFIGS from '../src/lib/platform-registry'

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 AlipayDefined(nt:WIFI,ws:360|640|1.5) AliApp(AP/9.0.1.073001) AlipayClient/9.0.1.073001   GCanvas/1.4.2.15'

describe('Normal Test', function() {
  const plt = setupPlatform(config)

  // setCssProps()
  it('setCssProps()', function() {
    expect(plt.Css).toEqual({
      animationDelay: 'webkitAnimationDelay',
      transform: 'webkitTransform',
      transformOrigin: '-webkit-transform-origin',
      transition: 'webkitTransition',
      transitionDelay: '-webkit-transition-delay',
      transitionDuration: '-webkit-transition-duration',
      transitionEnd: 'webkitTransitionEnd transitionend',
      transitionTimingFn: '-webkit-transition-timing-function'
    })
  })

  it('is()', function() {
    expect(plt.is('core')).toBeTruthy()
  })

  it('versions()', function() {
    expect(plt.versions()).toEqual({})
  })

  it('platforms()', function() {
    expect(plt.platforms().toString()).toMatch('core')
  })

  it('ready()', function() {
    return plt.ready().then(function(data) {
      expect(data).toEqual('dom')
    })
  })

  it('setDir()', function() {
    plt.setDir('rtl', false)
    expect(plt.dir()).toEqual('rtl')
    plt.setDir('rtl', true)
    expect(plt.dir()).toEqual('rtl')
    expect(plt.doc()['documentElement'].getAttribute('dir')).toEqual('rtl')
  })

  it('setLang()', function() {
    plt.setLang('en', false)
    expect(plt.lang()).toEqual('en')
    plt.setLang('cn', true)
    expect(plt.lang()).toEqual('cn')
    expect(plt.doc()['documentElement'].getAttribute('lang')).toEqual('cn')
  })

  it('settings()', function() {
    expect(plt.settings()).toEqual({ mode: 'md' })
  })

  it('url()', function() {
    expect(plt.url()).toEqual('about:blank')
  })

  it('setNavigatorPlatform()', function() {
    plt.setNavigatorPlatform('MacIntel')
    expect(plt.navigatorPlatform()).toEqual('MacIntel')
    plt.setNavigatorPlatform('')
    expect(plt.navigatorPlatform()).toEqual('')
  })

  it('isPortrait()', function() {
    expect(plt.isPortrait()).toEqual(null)
  })

  it('isLandscape()', function() {
    expect(plt.isLandscape()).toBeTruthy()
  })

  it('windowLoad()', function(cb) {
    plt.windowLoad(function(win: Window, doc: HTMLDocument) {
      expect(plt.win()).toEqual(win)
      expect(plt.doc()).toEqual(doc)
      cb()
    })
  })

  it('setPlatformConfigs()', function() {
    plt.setPlatformConfigs(config)
    expect(plt.getPlatformConfig('wechat')).toEqual(config.wechat)
  })

  it('registry()', function() {
    const _plt = setupPlatform(config)
    expect(_plt.registry()).toEqual(mergeConfigs(PLATFORM_CONFIGS, config))
  })

  it('testQuery()', function() {
    expect(plt.testQuery('a;b;c;d', 'a')).toBeTruthy()
  })

  it('matchUserAgentVersion()', function() {
    const _plt = setupPlatform(config)
    _plt.setUserAgent(UA)
    expect(_plt.matchUserAgentVersion(/alipayclient\/(\d+).(\d+).(\d+)?/i)).toEqual({
      major: '9',
      minor: '0',
      patch: '1'
    })
  })

  it('matchUserAgentVersion()', function() {
    const _plt = setupPlatform(config)
    _plt.setUserAgent('')
    expect(_plt.testUserAgent('anything')).toBeFalsy()
  })

  it('isPlatformMatch()', function() {
    const _plt = setupPlatform(config)
    _plt.setUserAgent(UA)
    expect(_plt.isPlatformMatch('alipay', ['alipay', 'alipayclient'], ['qq'])).toBeTruthy()
  })
})
