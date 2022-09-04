import { Test, TestingModule } from '@nestjs/testing'
import {
  UnleashStrategiesService,
  UnleashStrategy,
} from '../unleash-strategies'
import { ToggleEntity } from './entity/toggle.entity'
import { MetricsService } from './metrics.service'
import { ToggleRepository } from './repository/toggle-repository'
import { UNLEASH_MODULE_OPTIONS } from './unleash.constants'
import { UnleashContext } from './unleash.context'
import { UnleashService } from './unleash.service'

jest.mock('@nestjs/common/services/logger.service')

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>

function createFeatureToggle(
  params: Optional<
    ToggleEntity,
    'id' | 'enabled' | 'description' | 'strategies'
  >,
): ToggleEntity {
  return {
    strategies: [],
    enabled: true,
    description: '',
    id: params.name,
    ...params,
  }
}

class AlwaysOnStrategy implements UnleashStrategy {
  name = 'alwaysOn'

  isEnabled(_parameters: unknown, _context: UnleashContext): boolean {
    return true
  }
}

class AlwaysOffStrategy implements UnleashStrategy {
  name = 'alwaysOff'

  isEnabled(_parameters: unknown, _context: UnleashContext): boolean {
    return false
  }
}

class AlwaysThrowsStrategy implements UnleashStrategy {
  name = 'alwaysThrows'

  isEnabled(_parameters: unknown, _context: UnleashContext): boolean {
    throw new Error('ohoh')
  }
}

describe('UnleashService', () => {
  let service: UnleashService
  let toggles: ToggleRepository
  let metrics: jest.Mocked<MetricsService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToggleRepository,
        UnleashService,
        {
          provide: UnleashStrategiesService,
          useValue: {
            find(name: string): UnleashStrategy | undefined {
              return [
                new AlwaysOffStrategy(),
                new AlwaysOnStrategy(),
                new AlwaysThrowsStrategy(),
              ].find((strategy) => strategy.name === name)
            },
          },
        },
        { provide: MetricsService, useValue: { increase: jest.fn() } },
        { provide: UNLEASH_MODULE_OPTIONS, useValue: {} },
        UnleashContext,
      ],
    }).compile()

    metrics = module.get(MetricsService)
    toggles = module.get(ToggleRepository)
    service = await module.resolve(UnleashService)
  })

  describe('_isEnabled()', () => {
    it('returns the default value if the feature is not found', () => {
      expect(service.isEnabled('foo', true)).toBe(true)
      expect(service.isEnabled('foo', false)).toBe(false)
    })

    it('returns the default value if the feature exists, but is disabled', () => {
      toggles.create(createFeatureToggle({ name: 'foo', enabled: false }))

      expect(service.isEnabled('foo', false)).toBe(false)
      expect(service.isEnabled('foo', true)).toBe(true)
    })

    describe('returns the enabled property if no strategy is found', () => {
      test('enabled: true', () => {
        toggles.create(createFeatureToggle({ name: 'foo', enabled: true }))

        expect(service.isEnabled('foo')).toBe(true)
      })

      test('enabled: false', () => {
        toggles.create(createFeatureToggle({ name: 'foo', enabled: false }))

        expect(service.isEnabled('foo')).toBe(false)
      })
    })

    it('returns false if the strategy is not found', () => {
      toggles.create(
        createFeatureToggle({
          name: 'foo',
          strategies: [{ name: 'something', parameters: {} }],
        }),
      )

      expect(service.isEnabled('foo')).toBe(false)
    })

    describe('strategy testing', () => {
      test('enabled: true', () => {
        toggles.create(
          createFeatureToggle({
            name: 'foo',
            strategies: [{ name: 'alwaysOn', parameters: {} }],
          }),
        )

        expect(service.isEnabled('foo')).toBe(true)
      })

      test('enabled: false', () => {
        toggles.create(
          createFeatureToggle({
            name: 'foo',
            strategies: [{ name: 'alwaysOff', parameters: {} }],
          }),
        )

        expect(service.isEnabled('foo')).toBe(false)
      })

      it('interprets exceptions as `false`', () => {
        toggles.create(
          createFeatureToggle({
            name: 'foo',
            strategies: [{ name: 'alwaysThrows', parameters: {} }],
          }),
        )

        expect(service.isEnabled('foo')).toBe(false)

        // @ts-ignore
        expect(service.logger.error).toHaveBeenCalledWith(
          'ohoh',
          expect.any(String), // stack
        )
      })

      it('warns when a stale toggle is used', () => {
        toggles.create(
          createFeatureToggle({
            name: 'foo',
            strategies: [],
            stale: true,
          }),
        )

        service.isEnabled('foo')

        // @ts-ignore
        expect(service.logger.warn).toHaveBeenCalledWith('Toggle is stale: foo')
      })
    })

    test('isEnabled()', () => {
      expect(service.isEnabled('foo')).toBe(false)
      expect(metrics.increase).toHaveBeenCalledWith('foo', false)
    })
  })
})
