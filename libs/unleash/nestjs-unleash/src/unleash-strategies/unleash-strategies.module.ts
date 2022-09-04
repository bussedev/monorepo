import { DynamicModule, Module, Provider } from '@nestjs/common'
import {
  ApplicationHostnameStrategy,
  DefaultStrategy,
  FlexibleRolloutStrategy,
  GradualRolloutSessionIdStrategy,
  RemoteAddressStrategy,
  UserWithIdStrategy,
} from './strategy'
import { GradualRolloutRandomStrategy } from './strategy/gradual-rollout-random'
import { GradualRolloutUserIdStrategy } from './strategy/gradual-rollout-user-id'
import { CUSTOM_STRATEGIES } from './unleash-strategies.constants'
import {
  UnleashStrategiesModuleAsyncOptions,
  UnleashStrategiesModuleOptions,
  UnleashStrategiesOptionsFactory,
} from './unleash-strategies.interface'
import { UnleashStrategiesService } from './unleash-strategies.service'

@Module({
  providers: [
    DefaultStrategy,
    ApplicationHostnameStrategy,
    FlexibleRolloutStrategy,
    RemoteAddressStrategy,
    UserWithIdStrategy,
    GradualRolloutRandomStrategy,
    GradualRolloutSessionIdStrategy,
    GradualRolloutUserIdStrategy,
  ],
})
export class UnleashStrategiesModule {
  static register({
    strategies = [],
  }: UnleashStrategiesModuleOptions): DynamicModule {
    return {
      module: UnleashStrategiesModule,
      providers: [
        UnleashStrategiesService,
        { provide: CUSTOM_STRATEGIES, useValue: strategies },
      ],
      exports: [
        UnleashStrategiesService,
        { provide: CUSTOM_STRATEGIES, useValue: strategies },
      ],
    }
  }

  public static registerAsync(
    options: UnleashStrategiesModuleAsyncOptions,
  ): DynamicModule {
    const providers = this.createStrategiesProviders(options)
    return {
      module: UnleashStrategiesModule,
      imports: options.imports,
      providers: [
        ...(options.extraProviders ?? []),
        ...providers,
        UnleashStrategiesService,
      ],
      exports: [...providers, UnleashStrategiesService],
    }
  }

  static createStrategiesProviders(
    options: UnleashStrategiesModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createStrategiesOptionsProvider(options)]
    }

    return [
      this.createStrategiesOptionsProvider(options),
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        provide: options.useClass!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        useClass: options.useClass!,
      },
    ]
  }

  private static createStrategiesOptionsProvider(
    options: UnleashStrategiesModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: CUSTOM_STRATEGIES,
        useFactory: options.useFactory,
        inject: options.inject,
      }
    }

    return {
      provide: CUSTOM_STRATEGIES,
      useFactory: async (optionsFactory: UnleashStrategiesOptionsFactory) =>
        optionsFactory.createStrategiesOptions(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      inject: [options.useExisting || options.useClass!],
    }
  }
}
