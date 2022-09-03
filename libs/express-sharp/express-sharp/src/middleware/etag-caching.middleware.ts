import etag from 'etag'
import { NextFunction, Request, Response } from 'express'

export function etagCaching(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader('ETag', etag(JSON.stringify(res.locals.dto), { weak: true }))

  if (!req.fresh) {
    next()
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  res.sendStatus(304)
}
