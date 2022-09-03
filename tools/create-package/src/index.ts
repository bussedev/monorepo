// https://github.com/vercel/next.js/blob/canary/packages/create-next-app/index.ts

import { readdir } from 'fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'path'
import prompts from 'prompts'
import { PackageType } from './create-package.interfaces.js'
import { scaffold } from './scaffold.js'

async function getServiceGroups(): Promise<string[]> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  return readdir(path.join(__dirname, '../../../services'))
}

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { confirm, ...data } = await prompts([
    {
      name: 'type',
      message: 'Please select a package type',
      type: 'select',
      choices: [
        {
          title: 'Nest Library',
          value: PackageType.NestLibrary,
          description: 'A library that can be used in NestJS applications',
          selected: true,
        },
        {
          title: 'Nest Service',
          value: PackageType.NestService,
          description: 'A service to be deployed to the Kubernetes cluster',
        },
        {
          title: 'Library',
          value: PackageType.Library,
          description: 'A library that can be used by other libraries',
        },
      ],
    },
    {
      type: (prev) => (prev == PackageType.NestService ? 'autocomplete' : null),
      name: 'serviceGroup',
      message: 'Select a service group',
      choices: (await getServiceGroups()).map((title) => ({ title })),
      limit: 20,
    },
    {
      name: 'name',
      type: 'text',
      message: "What's the package name?",
      format: (value: string) => value.toLowerCase(),
      initial: 'test',
      validate: (value: string) =>
        /^[\w-]+$/.test(value)
          ? true
          : 'Name must be only letters, numbers, dashes and underscores',
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Confirm?',
      initial: true,
    },
  ])

  if (confirm) {
    await scaffold(data)
  }
}

// eslint-disable-next-line toplevel/no-toplevel-side-effect
void main()
