import { NetScan } from '@busse/net-scan'
import { PluggitClient } from '@busse/pluggit'
import {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge'
import { isIP } from 'net'
import { PluggitApAccessory } from './pluggit-ap.accessory'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings'

export interface PluggitConfig {
  address: string
  platform: string
}

export class PluggitPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic

  public readonly accessories: PlatformAccessory[] = []

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.info('Finished initializing platform:', this.config.platform)

    this.api.on('didFinishLaunching', () => {
      void this.bootstrap()
    })
  }

  async bootstrap(): Promise<void> {
    try {
      const address = (this.config as PluggitConfig).address

      if (/\/\d{1,2}$/.test(address)) {
        this.log.debug('address is a network address')
        await this.discoverDevices()
      } else if (isIP(address)) {
        this.log.debug('address is an IP address')
        await this.handleDiscoveredDevice(address)
      } else {
        this.log.info('Plugin is not configured')
      }
    } catch (error_) {
      const error =
        error_ instanceof Error ? error_ : new Error(JSON.stringify(error_))
      this.log.error(error.message)
    }
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info('Loading accessory from cache:', accessory.displayName)
    this.accessories.push(accessory)
  }

  async discoverDevices(): Promise<void> {
    const address = (this.config as PluggitConfig).address
    const scanner = new NetScan(address)
    this.log.info(`Scanning network ${address} for Pluggit devices...`)

    const addresses = await scanner.scan(
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      502,
    )

    this.log.info('Found Pluggit devices:', addresses.join(', '))

    await Promise.all(
      addresses.map((address) => this.handleDiscoveredDevice(address)),
    )
  }

  async handleDiscoveredDevice(ipAddress: string): Promise<void> {
    const pluggit = new PluggitClient(ipAddress)

    const uuid = this.api.hap.uuid.generate(await pluggit.getMacAddress())

    const existingAccessory = this.accessories.find(
      (accessory) => accessory.UUID === uuid,
    )

    const displayName = `${await pluggit.getSystemName()} (${await pluggit.getUnitType()}, ${await pluggit.getMacAddress()})`

    if (existingAccessory) {
      this.log.info(`Restoring existing accessory from cache: ${displayName}`)

      new PluggitApAccessory(this, existingAccessory, pluggit)
    } else {
      this.log.info(`Adding new accessory:  ${displayName})`)

      const accessory = new this.api.platformAccessory(displayName, uuid)

      new PluggitApAccessory(this, accessory, pluggit)

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ])
    }
  }
}
