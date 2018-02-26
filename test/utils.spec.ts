import { setupPlatform } from '../src/platform'
import { isIosUIWebView, isSafari, isWKWebView } from '../src/lib/platform-utils'

const config = {}

interface Win extends Window {
  webkit?: any
}

describe('Test utils', function() {
  it('isSafari()', function() {
    const _plt = setupPlatform(config)
    _plt.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    )
    _plt.init()
    expect(isSafari(_plt)).toBeTruthy()
  })

  it('isWKWebView()', function() {
    const _plt = setupPlatform(config)
    _plt.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    )
    const win: Win = window
    win.webkit = true
    _plt.setWindow(win)
    _plt.init()
    expect(isWKWebView(_plt)).toBeTruthy()
  })

  it('isIosUIWebView()', function() {
    const _plt = setupPlatform(config)
    _plt.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 xafari/601.1'
    )
    const win: Win = window
    win.webkit = false
    _plt.setWindow(win)
    _plt.init()
    expect(isIosUIWebView(_plt)).toBeTruthy()
  })
})
