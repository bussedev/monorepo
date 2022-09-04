import { ModbusTCPClient } from 'jsmodbus'
import { Socket } from 'net'
import pLimit from 'p-limit'

export class ModBusConnection {
  readonly #modbus: ModbusTCPClient
  readonly #ipAddress: string
  readonly #limited = pLimit(1)
  readonly #socket: Socket

  constructor(ipAddress: string, socket = new Socket()) {
    this.#ipAddress = ipAddress
    this.#socket = socket
    this.#modbus = new ModbusTCPClient(this.#socket)
  }

  async request<T>(
    fn: (modbus: ModbusTCPClient) => T | Promise<T>,
  ): Promise<T> {
    return this.#limited(async () => {
      await this.ensureConnected()
      return fn(this.#modbus)
    })
  }

  async ensureConnected(): Promise<void> {
    if (this.#modbus.connectionState === 'offline') {
      await this.connect()
    }
  }

  async connect(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.#socket.connect({ host: this.#ipAddress, port: 502 }, () => {
        resolve()
      })
    })
  }

  async disconnect(): Promise<void> {
    await new Promise<void>((resolve) =>
      this.#socket.end(() => {
        resolve()
      }),
    )
  }
}
