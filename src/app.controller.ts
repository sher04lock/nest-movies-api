import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { logger } from './common/logger/LoggerProvider';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    logger.info('hello');
    return this.appService.ping();
  }
}
