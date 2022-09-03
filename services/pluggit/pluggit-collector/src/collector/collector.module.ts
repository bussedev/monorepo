import { PluggitClientModule } from '@busse/nest-pluggit'
import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { InfluxDbModule } from '../influxdb'
import { CollectorController } from './collector.controller'
import { CollectorService } from './collector.service'

@Module({
  imports: [
    InfluxDbModule,
    PluggitClientModule.forRoot('192.168.100.94'),
    ScheduleModule.forRoot(),
  ],
  providers: [CollectorService],
  controllers: [CollectorController],
})
export class CollectorModule {}
