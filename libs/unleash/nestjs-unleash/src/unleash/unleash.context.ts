import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { ExpressSession, FastifySession, Request } from '../unleash-strategies'
import { UNLEASH_MODULE_OPTIONS } from './unleash.constants'
import { UnleashModuleOptions } from './unleash.interfaces'

const defaultUserIdFactory = (request: Request<{ id: string }>) => {
  return request.user?.id?.toString()
}

@Injectable({ scope: Scope.REQUEST })
export class UnleashContext<TCustomData = unknown> {
  #customData?: TCustomData

  constructor(
    @Inject(REQUEST) private request: Request<{ id: string }>,
    @Inject(UNLEASH_MODULE_OPTIONS)
    private readonly options: UnleashModuleOptions,
  ) {}

  getUserId(): string | undefined {
    const userIdFactory = this.options.userIdFactory ?? defaultUserIdFactory
    return userIdFactory(this.request)
  }

  getRemoteAddress(): string | undefined {
    return this.request.ip
  }

  getSessionId(): string | undefined {
    return (
      (this.request.session as ExpressSession | undefined)?.id ||
      (this.request.session as FastifySession | undefined)?.sessionId
    )
  }

  getRequest<T = Request<{ id: string }>>(): T {
    return this.request as T
  }

  get customData(): TCustomData | undefined {
    return this.#customData
  }

  extend(customData: TCustomData | undefined): UnleashContext<TCustomData> {
    this.#customData = customData

    return this
  }
}
