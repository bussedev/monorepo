import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'
import { AppConfig } from './app.config'
import { AppModule } from './app.module'

void (async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  const logger = app.get(Logger)
  app.useLogger(logger)

  app.enableShutdownHooks()

  const appConfig = app.get(AppConfig)

  await app.listen(appConfig.port)
  logger.log(`Application is running on: ${await app.getUrl()} 🎉`)
})()
