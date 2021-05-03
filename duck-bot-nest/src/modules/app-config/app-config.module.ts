import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageModule, TelegramSessionStorage } from '@modules/storage/';
import { TelegrafConfigService } from './services/telegraf.config.service';
import { TypeOrmConfigService } from './services/typeorm.config.service';

@Module({
  imports: [ConfigModule, StorageModule],
  providers: [TelegrafConfigService, TypeOrmConfigService, ConfigService, TelegramSessionStorage],
  exports: [TelegrafConfigService, TypeOrmConfigService],
})
export class AppConfigModule {}
