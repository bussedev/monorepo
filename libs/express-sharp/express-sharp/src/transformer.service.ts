import { ResizeDto } from '@express-sharp/common'
import { format, getLogger, ImageAdapter, Result } from '@express-sharp/core'
import Keyv from 'keyv'
import sharp from 'sharp'
import { singleton } from 'tsyringe'
import { CachedImage } from './cached-image'
import { ObjectHash } from './object-hash.service'

const DEFAULT_CROP_MAX_SIZE = 2000
const log = getLogger('transformer')

@singleton()
export class Transformer {
  cropMaxSize = DEFAULT_CROP_MAX_SIZE

  constructor(
    private readonly objectHasher: ObjectHash,
    private readonly cache: Keyv<Result>,
    private readonly cachedOriginalImage: CachedImage,
  ) {}

  getCropDimensions(maxSize: number, width: number, height?: number): number[] {
    height = height || width

    if (width <= maxSize && height <= maxSize) {
      return [width, height]
    }

    const aspectRatio = width / height

    if (width > height) {
      return [maxSize, Math.round(maxSize / aspectRatio)]
    }

    return [maxSize * aspectRatio, maxSize].map((number) => Math.round(number))
  }

  buildCacheKey(id: string, options: ResizeDto, adapterName: string): string {
    const hash = this.objectHasher.hash(options)
    return `transform:${id}:${adapterName}:${hash}`
  }

  async transform(
    id: string,
    options: ResizeDto,
    imageAdapter: ImageAdapter,
  ): Promise<Result> {
    const cacheKey = this.buildCacheKey(
      id,
      options,
      imageAdapter.constructor.name,
    )

    const cachedImage = await this.cache.get(cacheKey)
    if (cachedImage) {
      log(`Serving ${id} from cache ...`)
      return cachedImage
    }

    log(`Resizing ${id} with options:`, JSON.stringify(options))

    const originalImage = await this.cachedOriginalImage.fetch(id, imageAdapter)

    if (!originalImage) {
      return {
        format: options.format,

        image: null,
      }
    }

    const transformer = sharp(originalImage).rotate()

    if (!options.format) {
      options.format = (await transformer.metadata()).format as format
    }

    if (options.crop) {
      const [cropWidth, cropHeight] = this.getCropDimensions(
        this.cropMaxSize,
        options.width,
        options.height,
      )
      transformer.resize(cropWidth, cropHeight, {
        position: options.gravity,
      })
    } else {
      transformer.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    const image = await transformer
      .toFormat(options.format, {
        progressive: options.progressive,
        quality: options.quality,
      })
      .toBuffer()

    log('Resizing done')

    const result = { format: options.format, image }

    log(`Caching ${cacheKey} ...`)
    await this.cache.set(cacheKey, result)
    return result
  }
}
