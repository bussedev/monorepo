export enum PackageType {
  NestLibrary = 'nest-lib',
  NestService = 'nest-service',
  Library = 'lib',
}

export interface ScaffoldVariables {
  nextFreeDebugPort: number
}

export interface ScaffoldOptions {
  name: string
  type: PackageType
  serviceGroup?: string
}

export type TemplateVariables = ScaffoldVariables & ScaffoldOptions

export interface VscodeLaunchConfigConfiguration {
  port: number
  presentation: {
    group: string
  }
}

export interface VscodeLaunchConfig {
  version: string
  configurations: VscodeLaunchConfigConfiguration[]
}
