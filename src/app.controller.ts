import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger('AppService');

  @Get()
  getHello(): string {
    this.logger.log('getHello');
    return this.appService.getHello();
  }
}
