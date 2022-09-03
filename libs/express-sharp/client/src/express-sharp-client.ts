import { ImageUrl } from '@express-sharp/common'
import { ConfigService } from '@express-sharp/config'
import { container } from 'tsyringe'

export function createClient(endpoint: string, secret?: string): ImageUrl {
  const clientContainer = container.createChildContainer()
  clientContainer.register('endpoint', { useValue: endpoint })

  if (secret) {
    clientContainer.resolve(ConfigService).set('signedUrl.secret', secret)
  }

  return clientContainer.resolve(ImageUrl)
}
