import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { Type } from '@nestjs/common'

/**
 * Erstellt eine Provider-Struktur für Nest-Module, die die
 * angegebene Provider-Klasse via `ts-jest/createMock` mockt.
 *
 * @example createMockProvider(MyProvider)
 * @param provider die Klasse des Providers
 * @returns Eine Struktur, die im `providers`-Abschnitt eines
 * Nest-Moduls verwendet werden kann:
 * `{provide: MyProvider, useValue: createMock<MyProvider>()}`
 */

export function createMockProvider<T extends object>(
  provider: Type<T>,
): {
  provide: Type<T>
  useValue: DeepMocked<T>
} {
  return {
    provide: provider,
    useValue: createMock<T>(),
  }
}
