import { Controller, Post } from '@nestjs/common'
import { CollectorService } from './collector.service'

@Controller()
export class CollectorController {
  constructor(private readonly collector: CollectorService) {}

  @Post()
  async measure() {
    await this.collector.collectTemperatures()
  }
}
