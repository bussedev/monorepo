import { ResizeDto } from '@express-sharp/common'
import { ImageAdapter } from '@express-sharp/core'
import { NextFunction, Request, Response } from 'express'
import { container } from 'tsyringe'
import { Transformer } from '../transformer.service'

export async function transformImage(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { dto, imageAdapter } = res.locals as {
    dto: ResizeDto
    imageAdapter: ImageAdapter
  }

  try {
    const transformer = container.resolve(Transformer)

    if (!dto.url) {
      throw new Error('Image url missing')
    }
    const { format, image } = await transformer.transform(
      dto.url,
      dto,
      imageAdapter,
    )

    if (!image || !format) {
      next()
      return
    }

    // TODO: Cache-Control, Last-Modified
    res.type(`image/${format}`)
    res.send(image)
  } catch (error) {
    next(error)
  }
}
