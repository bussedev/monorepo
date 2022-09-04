import { API } from 'homebridge'
import { PluggitPlatform } from './platform'
import { PLATFORM_NAME } from './settings'

export = (api: API): void => {
  api.registerPlatform(PLATFORM_NAME, PluggitPlatform)
}
