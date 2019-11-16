import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logIncomingRequest, logRequestEnd } from './common/logger/log-request';
import { requestIdInterceptor } from './common/logger/request-id-interceptor';
import { ConfigService } from './common/config/config.service';
import cls = require("cls-hooked");

async function bootstrap() {
  const config = new ConfigService();
  const logger = new Logger();
  const port = config.port;

  const ns = cls.createNamespace("global");

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(requestIdInterceptor(ns));
  app.use(logIncomingRequest);
  app.use(logRequestEnd);
  await app.listen(port);
  logger.log(`VideoApp API listening on port ${port}`, "Bootstrap");
}
bootstrap();
