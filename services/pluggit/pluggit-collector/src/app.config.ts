import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface AppConfigEnvironmentVariables {
  PORT: number
}

@Injectable()
export class AppConfig {
  readonly #config: ConfigService<AppConfigEnvironmentVariables>

  constructor(config: ConfigService<AppConfigEnvironmentVariables>) {
    this.#config = config
  }

  get port(): number {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return this.#config.get<number>('PORT', 3000)
  }
}
