'use strict';

import {PlatformConfigs} from './interface';
import assign from 'lodash/assign';

/**
 * @name mergeConfigs
 * @description
 * Merge Parameters, and the priority here:
 * 1. Custom parameters have higher priority than the default configuration,
 *     such as `core` configuration, custom priority is higher than the default.
 * 2. In the `plt.platforms()` array, the more advanced Platform parameters,
 *     the higher the priority is, such as: core < mobile < ios < iphone < cordova.
 * 3. The plain object will use `assign` to collect params, other types of parameters will be replaced directly.
 *
 * @param {PlatformConfigs} defaultConfigs - dist configs
 * @param {PlatformConfigs} customerConfigs - customer configs
 * @return {PlatformConfigs}
 */
export default function mergeConfigs(defaultConfigs: PlatformConfigs, customerConfigs: PlatformConfigs): PlatformConfigs {
  const isObject = (val: any) => typeof val === 'object';
  const isPlainObject = (val: any) => isObject(val) && Object.getPrototypeOf(val) === Object.prototype;

  if (!defaultConfigs || !customerConfigs) return {};
  if (!isPlainObject(defaultConfigs) || !isPlainObject(customerConfigs)) return {};

  let _finalConf = defaultConfigs;
  for (let outerKey in customerConfigs) {
    if (_finalConf[outerKey] && isObject(_finalConf[outerKey])) {
      let _cusConf: any = customerConfigs[outerKey];
      let _defConf: any = _finalConf[outerKey];
      for (let innerKey in _cusConf) {
        if (isPlainObject(_cusConf[innerKey]) && isPlainObject(_defConf[innerKey])) {
          assign(_defConf[innerKey], _cusConf[innerKey]);
        } else {
          _defConf[innerKey] = _cusConf[innerKey];
        }
      }
    } else {
      _finalConf[outerKey] = customerConfigs[outerKey];
    }
  }

  return _finalConf;
}
