import { InfluxDB } from '@influxdata/influxdb-client'
import { Module, Provider } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { InfluxDbConfig } from './influxdb.config'
import { WRITE_API } from './influxdb.constants'

const providers: Provider[] = [
  {
    provide: InfluxDB,
    useFactory: ({ options }: InfluxDbConfig) => new InfluxDB(options),
    inject: [InfluxDbConfig],
  },
  {
    provide: WRITE_API,
    useFactory: (
      influxDb: InfluxDB,
      { organization, bucket }: InfluxDbConfig,
    ) => influxDb.getWriteApi(organization, bucket),
    inject: [InfluxDB, InfluxDbConfig],
  },
]

@Module({
  imports: [ConfigModule],
  providers: [InfluxDbConfig, ...providers],
  exports: [...providers],
})
export class InfluxDbModule {}
