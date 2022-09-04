import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  ApplicationHostnameStrategy,
  DefaultStrategy,
  FlexibleRolloutStrategy,
  GradualRolloutRandomStrategy,
  GradualRolloutSessionIdStrategy,
  RemoteAddressStrategy,
  UnleashStrategy,
  UserWithIdStrategy,
} from './strategy'
import { GradualRolloutUserIdStrategy } from './strategy/gradual-rollout-user-id'
import { CUSTOM_STRATEGIES } from './unleash-strategies.constants'
import { UnleashStrategiesModuleOptions } from './unleash-strategies.interface'

@Injectable()
export class UnleashStrategiesService implements OnModuleInit {
  private strategies: UnleashStrategy[]

  constructor(
    userWithId: UserWithIdStrategy,
    hostname: ApplicationHostnameStrategy,
    remoteAddress: RemoteAddressStrategy,
    defaultStrategy: DefaultStrategy,
    flexibleRollout: FlexibleRolloutStrategy,
    gradualRolloutRandom: GradualRolloutRandomStrategy,
    gradualRolloutUserId: GradualRolloutUserIdStrategy,
    gradualRolloutSessionId: GradualRolloutSessionIdStrategy,
    @Inject(CUSTOM_STRATEGIES)
    private readonly options: UnleashStrategiesModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {
    this.strategies = [
      userWithId,
      hostname,
      remoteAddress,
      defaultStrategy,
      flexibleRollout,
      gradualRolloutRandom,
      gradualRolloutUserId,
      gradualRolloutSessionId,
    ]
  }

  async onModuleInit(): Promise<void> {
    for (const customStrategy of this.options.strategies) {
      this.strategies.push(await this.moduleRef.create(customStrategy))
    }
  }

  findAll(): UnleashStrategy[] {
    return this.strategies
  }

  find(name: string): UnleashStrategy | undefined {
    return this.strategies.find((strategy) => strategy.name === name)
  }

  add(strategy: UnleashStrategy): void {
    this.strategies.push(strategy)
  }
}
