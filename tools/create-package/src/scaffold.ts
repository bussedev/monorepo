import { camelize, capitalizeFirstLetter } from '@busse/common'
import chalk from 'chalk'
import cpy from 'cpy'
import { existsSync } from 'fs'
import Handlebars from 'handlebars'
import json5 from 'json5'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'path'
import {
  PackageType,
  ScaffoldOptions,
  ScaffoldVariables,
  TemplateVariables,
  VscodeLaunchConfig,
} from './create-package.interfaces.js'

// eslint-disable-next-line toplevel/no-toplevel-side-effect
Handlebars.registerHelper('capitalize', (str: string) =>
  capitalizeFirstLetter(camelize(str)),
)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function applyVariables(
  fileName: string,
  vars: TemplateVariables,
): Promise<void> {
  const content = Handlebars.compile(await readFile(fileName, 'utf8'))(vars)

  await Promise.all([
    writeFile(fileName.replace(/\.hbs$/, ''), content),
    unlink(fileName),
  ])
}

export async function getVariables(): Promise<ScaffoldVariables> {
  const launchJson = await readFile(
    path.join(__dirname, '../../../.vscode/launch.json'),
    'utf8',
  )

  const { configurations } = json5.parse<VscodeLaunchConfig>(launchJson)

  const ports = configurations
    .filter((config) => config.presentation.group === '#Compose')
    .map((config) => config.port)

  return { nextFreeDebugPort: Math.max(...ports) + 1 }
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const templateRoot = path.join(__dirname, '../templates', options.type)

  const targetDirectory = path.join(
    __dirname,
    '../../../',
    options.type === PackageType.NestService
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        `services/${options.serviceGroup!}`
      : 'libs',
    options.name,
  )

  if (!existsSync(templateRoot)) {
    console.error(
      chalk.red(`Template ${options.type} not found (${templateRoot})`),
    )
    return
  }

  const vars = await getVariables()

  const filesWritten = await cpy(`${templateRoot}/**`, targetDirectory, {
    dot: true,
    rename: (path: string) =>
      Handlebars.compile<TemplateVariables>(path)({ ...options, ...vars }),
  })

  await Promise.all(
    filesWritten
      .filter((file) => file.endsWith('.hbs'))
      .map(async (file) => applyVariables(file, { ...options, ...vars })),
  )

  console.log(
    chalk.bold(`🎉 Created package ${targetDirectory}!\n`),
    `  Please run`,
    chalk.white.bgGreen.bold(
      chalk.underline.italic('pnpm -w update-manifests'),
    ),
  )
}
