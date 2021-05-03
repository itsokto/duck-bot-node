import { BotUpdate } from './bot.update';
import { Module } from '@nestjs/common';
import { ImagesService } from './services/images.service';
import { DuckApi } from 'duck-node';

@Module({
  providers: [BotUpdate, ImagesService, DuckApi],
})
export class BotModule {}
