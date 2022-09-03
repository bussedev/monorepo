import ModbusRTU from 'modbus-serial'
import pLimit from 'p-limit'

export class ModBusConnection {
  readonly #modbus: ModbusRTU
  readonly #ipAddress: string
  readonly #limited = pLimit(1)

  constructor(ipAddress: string, modbus: ModbusRTU) {
    this.#ipAddress = ipAddress
    this.#modbus = modbus
  }

  async request<T>(fn: (modbus: ModbusRTU) => T | Promise<T>): Promise<T> {
    return this.#limited(async () => {
      if (!this.#modbus.isOpen) {
        await this.#modbus.connectTCP(this.#ipAddress, {})
      }

      return fn(this.#modbus)
    })
  }

  async disconnect(): Promise<void> {
    await new Promise((resolve) => this.#modbus.close(resolve))
  }
}
