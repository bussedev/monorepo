import { PluggitClient } from '@busse/nest-pluggit'
import { Point, WriteApi } from '@influxdata/influxdb-client'
import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { WRITE_API } from '../influxdb'

@Injectable()
export class CollectorService {
  constructor(
    private readonly pluggit: PluggitClient,
    @Inject(WRITE_API) private readonly writeApi: WriteApi,
    @InjectPinoLogger(CollectorService.name)
    private readonly logger: PinoLogger,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async collectTemperatures(): Promise<void> {
    this.logger.info('Collecting temperatures ...')

    const point = new Point('temperatures')
      .floatField('prmRamIdxT1', await this.pluggit.getOutdoorTemperatureT1())
      .floatField('prmRamIdxT2', await this.pluggit.getSupplyTemperatureT2())
      .floatField('prmRamIdxT3', await this.pluggit.getExtractTemperatureT3())
      .floatField('prmRamIdxT4', await this.pluggit.getExhaustTemperatureT4())
      .floatField('fan1Speed', await this.pluggit.getFan1Speed())
      .floatField('fan2Speed', await this.pluggit.getFan2Speed())
      .intField('speedLevel', await this.pluggit.getSpeedLevel())
      .tag('currentUnitMode', await this.pluggit.getCurrentUnitMode())
      .tag('bypassState', await this.pluggit.getBypassState())

    this.writeApi.writePoint(point)

    await this.writeApi.flush()

    this.logger.info('Successfully collected temperatures')
  }
}
