import { Platform } from '../platform'
import { PlatformConfig, PlatformVersion, Type } from './interface'
import assign from 'lodash/assign'

/**
 * @hidden
 */
export default class PlatformNode {
  name: string = ''
  type: Type = 0

  private c: PlatformConfig

  constructor(registry: { [name: string]: PlatformConfig }, platformName: string) {
    this.c = registry[platformName]
    this.name = platformName
    this.type = this.c.type
  }

  reduceSettings(totalSettings: any): any {
    return assign(totalSettings, this.settings())
  }

  settings() {
    return this.c.settings || {}
  }

  isMatch(p: Platform): boolean {
    return (this.c.isMatch && this.c.isMatch(p)) || false
  }

  initialize(plt: Platform) {
    this.c.initialize && this.c.initialize(plt)
  }

  version(plt: Platform): PlatformVersion | null {
    if (this.c.versionParser) {
      const v = this.c.versionParser(plt)
      if (v) {
        if (!v.patch) v.patch = '0'
        const str = v.major + '.' + v.minor + (v.patch ? '.' + v.patch : '')
        return {
          str: str,
          num: parseFloat(str),
          major: parseInt(v.major, 10),
          minor: parseInt(v.minor, 10),
          patch: parseInt(v.patch, 10)
        }
      }
    }
    return null
  }
}
