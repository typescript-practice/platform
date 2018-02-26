import { Platform, setupPlatform } from '../src/platform'

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

describe('Test platform.js without mock config', function() {
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
