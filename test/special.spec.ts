import { mergeConfigs, Platform, setupPlatform } from '../src/platform'

const config = {
  core: {
    type: 0,
    initialize: function(plt: Platform) {
      plt.prepareReady = function() {
        plt.triggerFail('core init failure')
      }
    }
  }
}

describe('Test ready()', function() {
  const plt = setupPlatform(config)

  it('is()', function() {
    expect(plt.is('core')).toBeTruthy()
  })

  it('ready():fail', function(cb) {
    plt.ready().then(
      function() {
        // empty
      },
      function(rejected) {
        expect(rejected).toEqual('core init failure')
        cb()
      }
    )
  })
})

describe('Test mergeConfigs', function() {
  it('mergeConfigs(undefined,undefined)', function() {
    const res = mergeConfigs(undefined as any, undefined as any)
    expect(res).toEqual({})
  })

  it('mergeConfigs(fn,fn)', function() {
    const fn = function() {
      // empty
    }
    const res = mergeConfigs(fn as any, fn as any)
    expect(res).toEqual({})
  })
})
