/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ModBusConnection } from './connection-manager'
import { ModbusRTU } from './pluggit.constants'
import {
  BypassState,
  Components,
  Register,
  RegisterType,
  SpeedLevel,
  UnitModeRead,
  UnitModeWrite,
  UnitType,
} from './pluggit.interfaces'
import { Registers } from './pluggit.registers'

// https://www.pluggit.com/fileserver/files/1413/609560454939420/21_08_2015_pluggit_uvc_controller_modbus_tcp_ip.pdf
/**
 * Grants access to the Pluggit UVC controller
 *
 * @param {string} ip - The IP address of the Pluggit UVC controller
 *
 * @example
 *
 * ```typescript
 *  const ipAddress = '192.168.100.123'
 *  const client = new PluggitClient(ipAddress)
 *
 *  const t1 = await client.getOutdoorTemperatureT1()
 *  const speedLevel = await client.getSpeedLevel() // 0-4
 *
 *  await client.setSpeedLevel(3)
 *  await client.setSystemName('My custom name')
 * ```
 */
export class PluggitClient {
  readonly #ip: string
  readonly #connection: ModBusConnection

  constructor(ip: string, modbus = new ModbusRTU()) {
    this.#ip = ip
    this.#connection = new ModBusConnection(this.#ip, modbus)
  }

  // The by-pass will open when all the following conditions are fulfilled:
  // T1 < T3-2
  // T1 > prmBypassTmin
  // T3 > prmBypassTmax
  async shouldBypassOpen() {
    const t1 = await this.getOutdoorTemperatureT1()
    const t3 = await this.getExtractTemperatureT3()
    const tMin = await this.getMinTemperatureForOutdoorAir()
    const tMax = await this.getMaxTemperatureForExtractAir()

    return t1 < t3 - 2 && t1 > tMin && t3 > tMax
  }

  // And close if one of the following conditions is fulfilled while open:
  // T1 > T3
  // T1 < (prmBypassTmin -2)
  // T3 < (prmBypassTmax -1
  async shouldBypassClose() {
    const t1 = await this.getOutdoorTemperatureT1()
    const t3 = await this.getExtractTemperatureT3()
    const tMin = await this.getMinTemperatureForOutdoorAir()
    const tMax = await this.getMaxTemperatureForExtractAir()

    return t1 > t3 || t1 < tMin - 2 || t3 < tMax - 1
  }

  async getBypassState() {
    const value = await this.#getActualValue('prmRamIdxBypassActualState')
    return BypassState[value] ?? 'Unknown'
  }

  async getOutdoorTemperatureT1(): Promise<number> {
    return this.#getActualValue('prmRamIdxT1')
  }

  async getSupplyTemperatureT2(): Promise<number> {
    return this.#getActualValue('prmRamIdxT2')
  }

  async getExtractTemperatureT3(): Promise<number> {
    return this.#getActualValue('prmRamIdxT3')
  }

  async getExhaustTemperatureT4(): Promise<number> {
    return this.#getActualValue('prmRamIdxT4')
  }

  #mapUnitMode(value: number): string {
    return UnitModeRead[value] ?? 'Unknown'
  }

  async getCurrentUnitMode(): Promise<string> {
    const value = await this.#getActualValue('prmCurrentBLState')
    return this.#mapUnitMode(value)
  }

  async isManualModeActive(): Promise<boolean> {
    const currentMode = await this.getCurrentUnitMode()
    return currentMode === 'Manual'
  }

  async isAwayModeActive(): Promise<boolean> {
    const currentMode = await this.getCurrentUnitMode()
    return currentMode === 'Away'
  }

  #isUnitMode(mode: unknown): mode is UnitModeWrite {
    return (
      typeof mode === 'number' && Object.values(UnitModeWrite).includes(mode)
    )
  }

  async setUnitMode(mode: UnitModeWrite | number) {
    await this.#connection.request(async (modbus) => {
      if (!this.#isUnitMode(mode)) {
        throw new Error(`Invalid unit mode: ${mode}`)
      }

      await modbus.writeRegisters(169 - 1, [mode, 0])
    })
  }

  async setAway() {
    await this.setUnitMode(UnitModeWrite.StartAwayMode)
  }

  async disableAway() {
    await this.setUnitMode(UnitModeWrite.EndAwayMode)
  }

  async setManualMode() {
    await this.setUnitMode(UnitModeWrite.Manual)
  }

  async disableManualMode() {
    await this.setUnitMode(UnitModeWrite.WeekProgram)
  }

  async setManualBypass() {
    await this.setUnitMode(UnitModeWrite.SelectManualBypass)
  }

  async getManualBypassDurationInMinutes() {
    return this.#getActualValue('prmRamIdxBypassManualTimeout')
  }

  async getMinTemperatureForOutdoorAir() {
    return this.#getActualValue('prmBypassTmin')
  }

  async getMaxTemperatureForExtractAir() {
    return this.#getActualValue('prmBypassTmax')
  }

  async getSpeedLevel(): Promise<number> {
    return this.#getActualValue('prmRomIdxSpeedLevel')
  }

  async setSpeedLevel(level: SpeedLevel) {
    await this.#connection.request(async (modbus) => {
      // await this.setManualMode()
      await modbus.writeRegisters(325 - 1, [level, 0])
    })
  }

  async getIpAddress() {
    const buffer = await this.#getActualValue('prmCurrentIPAddress', true)

    return [
      buffer.readUIntBE(2, 1),
      buffer.readUIntBE(3, 1),
      buffer.readUIntBE(0, 1),
      buffer.readUIntBE(1, 1),
    ].join('.')
  }

  async getMacAddress() {
    const buffer = await this.#getActualValue('prmMACAddr', true)
    buffer.swap32()
    buffer.swap16()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return buffer.slice(2).toString('hex').match(/.{2}/g)!.join(':')
  }

  async getInstallationDate() {
    const value = await this.#getActualValue('prmStartExploitationDateStamp')
    return new Date(value * 1000)
  }

  async getCurrentDate() {
    const value = await this.#getActualValue('prmDateTime')
    return new Date(value * 1000)
  }

  async getSerialNumber() {
    return this.#getActualValue('prmSystemSerialNum')
  }

  async getFirmwareVersion() {
    const buffer = await this.#getActualValue('prmFWVersion', true)
    return [buffer.at(0), buffer.at(1)].join('.')
  }

  async getSystemName() {
    return this.#getActualValue('prmSystemName')
  }

  async setSystemName(name: string) {
    await this.#connection.request(async (modbus) => {
      if (name.length > 32) {
        throw new Error('System name is too long')
      }

      const buffer = Buffer.alloc(32)
      buffer.write(name, 0, 32, 'utf8')
      buffer.swap16()

      await modbus.writeRegisters(9 - 1, buffer)
    })
  }

  async getFan1Speed() {
    return this.#getActualValue('prmHALTaho1')
  }

  async getFan2Speed() {
    return this.#getActualValue('prmHALTaho2')
  }

  async getRemainingFilterDays(): Promise<number> {
    return this.#getActualValue('prmFilterRemainingTime')
  }

  #getActualValue(name: string, asBuffer: true): Promise<Buffer>
  #getActualValue(name: string): Promise<number>
  #getActualValue(name: string, asBuffer = false): Promise<number | Buffer> {
    const register = this.#findRegisterByName(name)

    return this.#connection.request(async (modbus) => {
      const length =
        register.length ?? (register.type === RegisterType.Int16 ? 1 : 2)

      const { buffer } = await modbus.readHoldingRegisters(
        register.id - 1,
        length,
      )

      if (asBuffer) {
        return buffer
      }

      let value: number
      switch (register.type) {
        case RegisterType.Int16: {
          value = buffer.readInt16BE()
          break
        }
        case RegisterType.Int32: {
          buffer.swap16()
          value = buffer.readUInt32BE()
          break
        }
        case RegisterType.Float: {
          value = buffer.readFloatBE()
          break
        }
        case RegisterType.Date: {
          buffer.swap16()
          value = buffer.readUint32LE()
          break
        }
        case RegisterType.String: {
          buffer.swap16()
          value = buffer.toString().replace(/\0/g, '') as unknown as number
          break
        }
      }

      return value
    })
  }

  #findRegisterByName(name: string): Register {
    const register = Registers.find((r) => r.name === name)

    if (!register) {
      throw new Error(`Register ${name} not found`)
    }

    return register
  }

  async #getSystemBytes() {
    return this.#getActualValue('prmSystemID', true)
  }

  async getUnitType() {
    const bytes = await this.#getSystemBytes()

    const value = bytes.at(2)

    return UnitType[value ?? 0] ?? 'Unknown'
  }

  async getInstalledComponents() {
    const buffer = await this.#getSystemBytes()
    const firstByte = buffer.reverse().readUint32BE(0)

    const installedComponents = Object.entries(Components)
      .filter(([, value]) => typeof value === 'number')
      .map(([key, value]) => [key, !!(firstByte & (value as number))])

    return Object.fromEntries(installedComponents) as Record<string, boolean>
  }

  async getWorkTimeInHours() {
    const buffer = await this.#getActualValue('prmWorkTime', true)
    return buffer.reverse().readUint32BE()
  }
}
