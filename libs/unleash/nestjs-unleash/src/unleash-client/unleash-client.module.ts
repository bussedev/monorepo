import { HttpModule } from '@nestjs/axios'
import { DynamicModule, Module, Provider } from '@nestjs/common'
import { AxiosRequestConfig } from 'axios'
import { UnleashStrategiesModule } from '../unleash-strategies'
import { UnleashFeaturesClient } from './features/features-client'
import { UnleashMetricsClient } from './metrics/metrics-client'
import { UnleashRegisterClient } from './register/register-client'
import { UnleashClient } from './unleash-client'
import { UNLEASH_CLIENT_OPTIONS } from './unleash-client.constants'
import {
  UnleashClientModuleAsyncOptions,
  UnleashClientModuleOptions,
} from './unleash-client.interfaces'

@Module({})
export class UnleashClientModule {
  private static optionsFactory(
    options: UnleashClientModuleOptions,
  ): AxiosRequestConfig {
    return {
      ...options.http,
      baseURL: options.baseURL,

      headers: {
        ...options.http?.headers,
        'UNLEASH-INSTANCEID': options.instanceId,
        'UNLEASH-APPNAME': options.appName,
      },
    }
  }

  static register(options: UnleashClientModuleOptions): DynamicModule {
    return {
      module: UnleashClientModule,
      imports: [
        HttpModule.register(UnleashClientModule.optionsFactory(options)),
        UnleashStrategiesModule,
      ],
      providers: [{ provide: UNLEASH_CLIENT_OPTIONS, useValue: options }],
    }
  }

  public static registerAsync(
    options: UnleashClientModuleAsyncOptions,
  ): DynamicModule {
    const provider: Provider = {
      provide: UNLEASH_CLIENT_OPTIONS,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      useFactory: options.useFactory!,
      inject: options.inject,
    }
    return {
      module: UnleashStrategiesModule,
      imports: [
        ...(options.imports ?? []),
        HttpModule.registerAsync({
          useFactory: (options: UnleashClientModuleOptions) =>
            UnleashClientModule.optionsFactory(options),
          inject: [UNLEASH_CLIENT_OPTIONS],
        }),
      ],
      providers: [
        provider,
        UnleashStrategiesModule,
        UnleashClient,
        UnleashFeaturesClient,
        UnleashMetricsClient,
        UnleashRegisterClient,
      ],
      exports: [
        provider,
        UnleashClient,
        UnleashFeaturesClient,
        UnleashMetricsClient,
        UnleashRegisterClient,
      ],
    }
  }
}
