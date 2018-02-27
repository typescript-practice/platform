export type DocumentDirection = 'ltr' | 'rtl'
export type PlatformConfigs = { [key: string]: PlatformConfig }

// Use type to determine uniqueness;
// For example: 'ios' and 'android' will not co-exist at the same time
export enum Type {
  BASE = 0,
  PLATFORM = 1,
  SYSTEM = 2,
  BRAND = 3,
  ENVIRONMENT = 4
} // 指定开始, 后面递增

export interface PlatformConfig {
  type: Type
  initialize?: Function
  settings?: {}
  isMatch?: Function
  versionParser?: Function
}

export interface PlatformVersion {
  str?: string
  num?: number
  major?: number
  minor?: number
  patch?: number
}

export interface BackButtonAction {
  fn: Function
  priority: number
}

export interface EventListenerOptions {
  capture?: boolean
  passive?: boolean
}

export interface SDKInfo {
  jsSDKUrl: string
  jsSDKName: string
  jsSDKEventName: string
  timeout?: number
}
