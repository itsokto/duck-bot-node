import { BotUpdate } from './bot.update';
import { Module } from '@nestjs/common';
import { ImagesService } from './services/images.service';
import { DuckApiFactory } from './services/duck-api-factory.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BotUpdate, ImagesService, DuckApiFactory],
})
export class BotModule {}
