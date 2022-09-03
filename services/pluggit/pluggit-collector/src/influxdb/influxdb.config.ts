import { ClientOptions } from '@influxdata/influxdb-client'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface InfluxDbConfigEnv {
  INFLUX_URL?: string
  INFLUX_BUCKET?: string
  INFLUX_ORGANIZATION?: string
  INFLUX_TOKEN?: string
}

@Injectable()
export class InfluxDbConfig {
  readonly #config: ConfigService<InfluxDbConfigEnv>

  constructor(config: ConfigService<InfluxDbConfigEnv>) {
    this.#config = config
  }

  get url(): string {
    return this.#config.get('INFLUX_URL', 'http://influxdb:8086')
  }

  get bucket(): string {
    return this.#config.get('INFLUX_BUCKET', 'pluggit')
  }

  get organization(): string {
    return this.#config.get('INFLUX_ORGANIZATION', 'busse')
  }

  get token(): string {
    const token = this.#config.get<string>('INFLUX_TOKEN')

    if (!token) {
      throw new Error('INFLUX_TOKEN is not set')
    }

    return token
  }

  get options(): ClientOptions {
    return {
      url: this.url,
      token: this.token,
    }
  }
}
