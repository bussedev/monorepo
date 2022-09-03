import { ClassProvider, Type } from '@nestjs/common'

function createClassMockFromModule<T extends Type>(
  jest_: typeof jest,
  type: T,
  moduleName: string,
): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  return jest_.createMockFromModule<any>(moduleName)[type.name] as T
}

export function mockClassProvider<T extends Type>(
  jest_: typeof jest,
  type: T,
  moduleName: string,
): ClassProvider<T> {
  return {
    provide: type,
    useClass: createClassMockFromModule(jest_, type, moduleName),
  }
}

export function createAutoMocker(jest_: typeof jest) {
  return {
    mockClassProvider: <T extends Type>(
      type: T,
      moduleName: string,
    ): ClassProvider<T> => mockClassProvider(jest_, type, moduleName),
  }
}

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function createClassMockFromModule<T extends new (...args: any) => any>(
//   type: T,
//   moduleName: string,
// ): T {
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
//   return jest.createMockFromModule<any>(moduleName)[type.name] as T
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function createClassProviderMock<T extends new (...args: any) => any>(
//   type: T,
//   moduleName: string,
// ): ClassProvider<T> {
//   return {
//     provide: type,
//     useClass: createClassMockFromModule(type, moduleName),
//   }
// }
