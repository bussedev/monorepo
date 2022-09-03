import { Lockfile, readWantedLockfile } from '@pnpm/lockfile-file'
import { Dependencies, PackageManifest, ProjectManifest } from '@pnpm/types'
import { existsSync } from 'fs'
import normalizePath from 'normalize-path'
import path from 'path'

export type MetaUpdaterRunnerResultFunction = (
  config: Record<string, unknown>,
  dir: string,
  manifest: ProjectManifest,
) => unknown | Promise<unknown | null> | null

export type MetaUpdaterRunnerResult = Record<
  string,
  MetaUpdaterRunnerResultFunction
>

export class MetaUpdaterRunner {
  readonly #updaters: MetaUpdater<unknown>[]

  constructor(...updaters: MetaUpdater<unknown>[]) {
    this.#updaters = updaters
  }

  async run(workspaceDir: string): Promise<MetaUpdaterRunnerResult> {
    const result: MetaUpdaterRunnerResult = {}

    const lockfile = await readWantedLockfile(workspaceDir, {
      ignoreIncompatible: false,
    })

    if (lockfile == null) {
      throw new Error('Lockfile not found')
    }

    for (const updater of this.#updaters) {
      result[updater.key] = async (
        data: Record<string, unknown>,
        dir: string,
        manifest: ProjectManifest,
      ): Promise<unknown> => {
        console.log(`Meta update for ${manifest.name || dir}`, {
          Updater: updater.constructor.name,
          File: `${dir}/${updater.key}`,
        })
        try {
          const context = await updater.update({
            workspaceDir,
            dir,
            data,
            manifest,
            lockfile,
          })
          return context.data
        } catch (error) {
          console.error('Update failed', { error })
          throw error
        }
      }
    }

    return result
  }
}

export type MetaUpdaterData = Record<string, unknown>

export interface MetaUpdaterContext<T = MetaUpdaterData> {
  workspaceDir: string
  dir: string
  data: T
  manifest: ProjectManifest
  lockfile: Lockfile
}

export abstract class MetaUpdater<T = MetaUpdaterData> {
  abstract get key(): string

  abstract update(
    context: MetaUpdaterContext<T>,
  ): Promise<MetaUpdaterContext<T>> | MetaUpdaterContext<T>

  protected getProjectType(
    context: MetaUpdaterContext<T>,
  ): 'service' | 'cli' | 'lib' | 'unknown' {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    switch (context.manifest.config?.type) {
      case 'service': {
        return 'service'
      }
      case 'lib': {
        return 'lib'
      }
      case 'cli': {
        return 'cli'
      }
      case undefined:
      default: {
        // ToDo: Sobald überall config.type angegeben ist, entfällt das hier
        if (!context.manifest.scripts?.start) {
          return 'lib'
        }
        return 'unknown'
      }
    }
  }

  protected isServiceProject(context: MetaUpdaterContext<T>): boolean {
    return this.getProjectType(context) === 'service'
  }

  protected isLibProject(context: MetaUpdaterContext<T>): boolean {
    return this.getProjectType(context) === 'lib'
  }
}

export class PackageJsonUpdater extends MetaUpdater<PackageManifest> {
  #peerDepScopes = ['@nestjs']
  #peerDeps = ['']

  #workspaceScopes = ['@busse']
  #workspaceScopesPackageExclude = ['@heise/eslint-config']
  #workspaceVersion = 'workspace:*'

  get key(): string {
    return 'package.json'
  }

  update(
    context: MetaUpdaterContext<PackageManifest>,
  ): MetaUpdaterContext<PackageManifest> {
    if (context.manifest.name === '@busse/monorepo') {
      return context
    }

    this.updateGeneral(context)

    if (this.isLibProject(context)) {
      this.updateLib(context)
    } else if (this.isServiceProject(context)) {
      this.updateService(context)
    }

    return context
  }

  updateGeneral(context: MetaUpdaterContext<PackageManifest>): void {
    this.setEngines(context)

    this.setScript(context, 'clean', 'rimraf dist *.tsbuildinfo')

    this.setScript(
      context,
      'lint',
      `eslint --cache ./src --ignore-path ${path.join(
        path.relative(context.dir, context.workspaceDir),
        '.eslintignore',
      )}`,
    )

    this.setScript(context, 'test', 'jest --passWithNoTests')

    if (context.data.dependencies) {
      context.data.dependencies = this.fixWorkspaceDeps(
        context.data.dependencies,
      )
    }
    if (context.data.devDependencies) {
      context.data.devDependencies = this.fixWorkspaceDeps(
        context.data.devDependencies,
      )
    }
  }

  updateLib(context: MetaUpdaterContext<PackageManifest>): void {
    this.fixPeerDeps(context)
  }

  updateService(context: MetaUpdaterContext<PackageManifest>): void {
    context.data = {
      bin: 'bin/main.js',
      ...context.data,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      pkg: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...context.data.pkg,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        targets: context.data.pkg?.targets ?? ['node16-alpine'],
        outputPath: '.build',
      },
    }

    this.setScript(
      context,
      'build:pkg',
      `pkg --options 'max-old-space-size=350' --compress GZip -o .build/main .`,
    )

    this.setScript(
      context,
      'docker:build',
      `pnpm run build && pnpm run build:pkg && docker build --network host -t ${context.manifest.name!.replace(
        '@',
        '',
      )} -f ${path.join(
        path.relative(context.dir, context.workspaceDir),
        'Dockerfile2',
      )} .`,
    )

    this.setScript(context, 'docker:publish', 'echo publish')

    Object.entries(context.data.dependencies ?? {})
      .filter((dep) => this.shouldPeerDep(dep))
      .forEach(([name]) => {
        context.data.dependenciesMeta = {
          ...context.data.dependenciesMeta,
          [name]: { injected: true },
        }
      })
  }

  setEngines(context: MetaUpdaterContext<PackageManifest>): void {
    context.data.engines = {
      node: '>=16.13.0',
      pnpm: '>=6.19.0',
    }
  }

  fixPeerDeps(context: MetaUpdaterContext<PackageManifest>): void {
    if (!context.data.dependencies) {
      return
    }

    Object.entries(context.data.dependencies)
      .filter((dep) => this.shouldPeerDep(dep))
      .forEach(([name, version]) => {
        context.data.devDependencies = {
          ...context.data.devDependencies,
          [name]: version,
        }

        context.data.peerDependencies = {
          ...context.data.peerDependencies,
          [name]: version,
        }

        delete context.data.dependencies![name]
      })

    Object.entries(context.data.peerDependencies ?? {}).forEach(([name]) => {
      if (context.data.devDependencies?.[name]) {
        context.data.peerDependencies = {
          ...context.data.peerDependencies,
          [name]: context.data.devDependencies[name]!,
        }
      }
    })
  }

  shouldPeerDep([name]: [name: string, version: string]): boolean {
    return (
      this.#peerDepScopes.some((peerDepScope) =>
        name.startsWith(peerDepScope),
      ) || this.#peerDeps.includes(name)
    )
  }

  fixWorkspaceDeps(deps: Dependencies): Dependencies {
    let workspaceDeps = this.getWorkspaceDeps(deps)

    // Setzt für alle Workspace Deps die Version aus #workspaceVersion
    workspaceDeps = workspaceDeps.map(([name, _version]) => [
      name,
      this.#workspaceVersion,
    ])

    return {
      ...deps,
      ...Object.fromEntries(workspaceDeps),
    } as Dependencies
  }

  getWorkspaceDeps(deps: Dependencies): [name: string, version: string][] {
    return Object.entries(deps).filter(
      ([name, _version]) =>
        this.#workspaceScopes.some((workspaceScope) =>
          name.startsWith(workspaceScope),
        ) && this.#workspaceScopesPackageExclude.includes(name) === false,
    )
  }

  setScript(
    context: MetaUpdaterContext<PackageManifest>,
    name: string,
    script: string,
    override = false,
  ): void {
    if (
      context.data.scripts &&
      context.data.scripts[name] &&
      override === false
    ) {
      return
    }

    context.data.scripts = {
      ...context.data.scripts,
      [name]: script,
    }
  }
}

export class TypeScriptConfigUpdater extends MetaUpdater {
  constructor(public readonly tsConfigKey: string) {
    super()
  }

  get key(): string {
    return this.tsConfigKey
  }

  update(context: MetaUpdaterContext): MetaUpdaterContext {
    if (
      context.data == null ||
      this.isTsConfigLib(context.manifest.name ?? '')
    ) {
      return context
    }

    const relative = normalizePath(
      path.relative(context.workspaceDir, context.dir),
    )

    const importer = context.lockfile.importers?.[relative]

    if (!importer) {
      return context
    }

    const deps = {
      ...importer.dependencies,
      ...importer.devDependencies,
    }

    const references = Object.entries(deps)
      .filter(([_name, value]) => value.startsWith('link:'))
      .map(([, dep]) => dep.slice('link:'.length))
      .filter(
        (relativePath) =>
          existsSync(path.join(context.dir, relativePath, 'tsconfig.json')) &&
          existsSync(path.join(context.dir, relativePath, 'src/index.ts')),
      )
      .map((path) => ({ path: `${path}/${this.tsConfigKey}` }))

    context.data = {
      ...context.data,
      ...(references && {
        references: references.sort((r1, r2) => r1.path.localeCompare(r2.path)),
      }),
    }

    return context
  }

  isTsConfigLib(packageName?: string): boolean {
    return packageName !== undefined && packageName.includes('/tsconfig')
  }
}

export class ESLintRcUpdater extends MetaUpdater {
  get key(): string {
    return '.eslintrc.json'
  }
  update(context: MetaUpdaterContext): MetaUpdaterContext {
    if (context.manifest.name?.startsWith('@busse')) {
      return context
    }

    context.data = {
      ...context.data,
      extends: '@busse',
    }

    return context
  }
}

const metaUpdaterRunner = new MetaUpdaterRunner(
  new PackageJsonUpdater(),
  new TypeScriptConfigUpdater('tsconfig.json'),
  new TypeScriptConfigUpdater('tsconfig.build.json'),
  new ESLintRcUpdater(),
)

export default (workspaceDir: string): Promise<MetaUpdaterRunnerResult> =>
  metaUpdaterRunner.run(workspaceDir)
