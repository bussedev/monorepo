import { getLogger, ImageAdapter } from '@express-sharp/core'
import { promises as fs } from 'fs'
import path_ from 'path'

export class FsAdapter implements ImageAdapter {
  private log = getLogger('adapter:fs')

  constructor(public rootPath: string) {
    this.log(`Using rootPath: ${rootPath}`)
  }

  async fetch(path: string): Promise<Buffer | undefined> {
    const imagePath = path_.join(this.rootPath, path)
    this.log(`Fetching: ${imagePath}`)
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      return await fs.readFile(imagePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined
      }

      throw error
    }
  }
}
