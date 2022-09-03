import { getLogger, ImageAdapter } from '@edged/core'
import Keyv from 'keyv'
import { singleton } from 'tsyringe'

const log = getLogger('cached-image')

@singleton()
export class CachedImage {
  constructor(private readonly cache: Keyv<Buffer>) {}

  async fetch(id: string, adapter: ImageAdapter): Promise<Buffer | undefined> {
    const cacheKey = `image:${id}`

    let image = await this.cache.get(cacheKey)

    if (image) {
      log(`Serving original image ${cacheKey} from cache ...`)
      return image
    }

    image = await adapter.fetch(id)

    if (image) {
      log(`Caching original image ${id} ...`)
      await this.cache.set(cacheKey, image)
    }

    return image
  }
}
