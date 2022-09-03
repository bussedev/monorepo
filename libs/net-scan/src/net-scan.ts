import { Socket } from 'net'
import { Netmask } from 'netmask'
import pLimit, { Limit } from 'p-limit'

export interface NetScanOptions {
  /** @default: 500 */
  concurrency?: number

  /** @default 500 */
  timeout?: number
}

export class NetScan {
  readonly #addresses: string[] = []
  readonly #limited: Limit
  readonly #timeout: number

  constructor(
    cidr: string,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    { concurrency = 500, timeout = 500 }: NetScanOptions = {},
  ) {
    this.#limited = pLimit(concurrency)
    this.#timeout = timeout

    new Netmask(cidr).forEach((ip) => {
      this.#addresses.push(ip)
    })
  }

  async scan(port: number): Promise<string[]> {
    const scans = this.#addresses.map((address) =>
      this.#limited(() => this.#scan(address, port)),
    )

    const results = await Promise.all(scans)

    return results.filter(
      (result): result is string => typeof result === 'string',
    )
  }

  async #scan(ipAddress: string, port: number): Promise<string | undefined> {
    return new Promise((resolve, _reject) => {
      const socket = new Socket()

      socket.on('connect', () => {
        socket.end()
      })

      socket.on('timeout', () => {
        socket.end()
        resolve(undefined)
      })

      socket.on('close', () => {
        resolve(ipAddress)
      })
      socket.on('error', () => {
        resolve(undefined)
      })

      socket.setTimeout(this.#timeout)
      socket.connect(port, ipAddress)
    })
  }
}
