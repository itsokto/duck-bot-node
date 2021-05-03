import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appInsights = require('applicationinsights');

async function bootstrap() {
  appInsights.setup().setAutoDependencyCorrelation(true, true).setSendLiveMetrics(true).start();
  const app = await NestFactory.create(AppModule);
  await app.listenAsync(process.env.PORT || 3000);
}
bootstrap();
