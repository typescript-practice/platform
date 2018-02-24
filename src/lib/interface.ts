export type DocumentDirection = 'ltr' | 'rtl';

export enum Type {BASE = 0, PLATFORM = 1, SYSTEM = 2, BRAND = 3, ENVIRONMENT = 4} // 指定开始, 后面递增

export interface PlatformConfig {
  type: Type;
  initialize?: Function;
  settings?: {};
  isMatch?: Function; // 匹配当前平台配置的方法
  versionParser?: any;
}

export interface PlatformVersion {
  str?: string;
  num?: number;
  major?: number;
  minor?: number;
  patch?: number;
}

export interface BackButtonAction {
  fn: Function;
  priority: number;
}

export interface EventListenerOptions {
  capture?: boolean;
  passive?: boolean;
}

export interface SDKInfo {
  jsSDKUrl: string,
  jsSDKName: string,
  jsSDKEventName: string,
  timeout?: number
}