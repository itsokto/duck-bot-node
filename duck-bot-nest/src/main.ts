import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appInsights = require('applicationinsights');

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    appInsights.setup().setAutoDependencyCorrelation(true, true).setSendLiveMetrics(true).start();
  }
  await NestFactory.createApplicationContext(AppModule);
}
bootstrap();
