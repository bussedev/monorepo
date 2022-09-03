import { ConfigService } from '@express-sharp/config'
import crypto from 'crypto'
import { injectable } from 'tsyringe'

@injectable()
export class ObjectHash {
  constructor(private readonly config: ConfigService) {}

  stringify(object: object): string {
    return JSON.stringify(object, Object.keys(object).sort())
  }

  hash(object: object): string {
    return crypto
      .createHash(this.config.get('objectHash.alogorithm', 'sha256'))
      .update(this.stringify(object))
      .digest('hex')
      .slice(0, parseInt(this.config.get('objectHash.hashLength', '10'), 10))
  }
}
