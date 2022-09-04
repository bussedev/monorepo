import { PluggitClient } from '@busse/pluggit'
import { DynamicModule, Module } from '@nestjs/common'
import { PLUGGIT_IP } from './pluggit.constants'

@Module({
  providers: [
    // {
    //   provide: ModbusRTU,
    //   useClass: ModbusRTU,
    // },
    {
      provide: PluggitClient,
      useFactory: (ip: string) => new PluggitClient(ip),
      inject: [PLUGGIT_IP],
    },
  ],
  exports: [PluggitClient],
})
export class PluggitClientModule {
  static forRoot(ip: string): DynamicModule {
    return {
      module: PluggitClientModule,
      providers: [
        {
          provide: PLUGGIT_IP,
          useValue: ip,
        },
      ],
      exports: [PluggitClient],
    }
  }
}
