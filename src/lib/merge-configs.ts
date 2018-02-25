'use strict';

import {PlatformConfigs} from './interface';
import assign from 'lodash/assign';

/**
 * @name mergeConfigs
 * @description
 * Merge Parameters
 * 1. [Merge Parameters] Custom parameters have higher priority than the default configuration,
 *     such as `core` configuration, custom priority is higher than the default
 * 2. [Platform Matching] In the `plt.platforms()` array, the more advanced Platform parameters,
 *     the higher the priority is, such as: core < mobile < ios < iphone < cordova
 */
export default function mergeConfigs(defaultConfigs: PlatformConfigs, customerConfig: PlatformConfigs): PlatformConfigs {
  const isObject = (val: any) => typeof val === 'object';
  const isPlainObject = (val: any) => isObject(val) && Object.getPrototypeOf(val) === Object.prototype;

  if (!defaultConfigs || !customerConfig) return {};
  if (!isPlainObject(defaultConfigs) || !isPlainObject(customerConfig)) return {};

  let _finalConf = defaultConfigs;
  for (let outerKey in customerConfig) {
    if (_finalConf[outerKey] && isObject(_finalConf[outerKey])) {
      let _cusConf: any = customerConfig[outerKey];
      let _defConf: any = _finalConf[outerKey];
      for (let innerKey in _cusConf) {
        if (isPlainObject(_cusConf[innerKey]) && isPlainObject(_defConf[innerKey])) {
          assign(_defConf[innerKey], _cusConf[innerKey]);
        } else {
          _defConf[innerKey] = _cusConf[innerKey];
        }
      }
    } else {
      _finalConf[outerKey] = customerConfig[outerKey];
    }
  }

  return _finalConf;
}
