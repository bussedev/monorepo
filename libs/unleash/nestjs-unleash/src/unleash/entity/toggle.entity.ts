import { Feature, Strategy } from '../../unleash-client'
import { Parameters } from '../../unleash-client/features/features-client.interfaces'

export class ToggleEntity {
  id: string

  name!: string
  description!: string
  enabled!: boolean
  strategies!: Strategy[]

  type?: string
  stale?: boolean
  strategy?: string
  parameters?: Parameters

  constructor(data: Feature) {
    Object.assign(this, data)
    this.id = data.name
  }
}
