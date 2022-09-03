import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { randomUUID } from 'crypto'
import { Request, Response } from 'express'
import { LoggerModule } from 'nestjs-pino'
import { AppConfig } from './app.config'
import { CollectorModule } from './collector'
import { HealthModule } from './health'

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      pinoHttp: {
        autoLogging: false,
        level: 'debug',
        quietReqLogger: true,
        genReqId: (req: Request, res: Response) => {
          let id = req.id || req.get('X-Request-Id')

          if (id) {
            return id
          }

          id = randomUUID()
          res.header('X-Request-Id', id)
          return id
        },
      },
    }),
    HealthModule,
    CollectorModule,
  ],
  providers: [AppConfig],
})
export class AppModule {}
