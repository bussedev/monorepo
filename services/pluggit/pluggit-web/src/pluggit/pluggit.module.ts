import { PluggitClientModule } from '@busse/nest-pluggit'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PluggitController } from './pluggit.controller'

@Module({
  imports: [ConfigModule, PluggitClientModule.forRoot('192.168.100.94')],
  controllers: [PluggitController],
})
export class PluggitModule {}
