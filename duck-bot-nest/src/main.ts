import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as appInsights from 'applicationinsights';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    appInsights.setup().setSendLiveMetrics(true).start();
  }
  await NestFactory.createApplicationContext(AppModule);
}
bootstrap();
