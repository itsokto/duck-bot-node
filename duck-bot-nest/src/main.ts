import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appInsights = require('applicationinsights');

async function bootstrap() {
  appInsights.setup().setAutoDependencyCorrelation(true, true).setSendLiveMetrics(true).start();
  await NestFactory.createApplicationContext(AppModule);
}
bootstrap();
