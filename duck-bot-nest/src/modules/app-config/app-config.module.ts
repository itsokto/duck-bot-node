import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageModule, TelegramSessionStorage } from '@modules/storage/';
import { TelegrafConfigService } from './services/telegraf.config.service';
import { TypeOrmConfigService } from './services/typeorm.config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from '@modules/bot';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useExisting: TypeOrmConfigService,
    }),
    TelegrafModule.forRootAsync({
      imports: [AppConfigModule, BotModule],
      useExisting: TelegrafConfigService,
    }),
  ],
  providers: [TelegrafConfigService, TypeOrmConfigService, ConfigService, TelegramSessionStorage],
  exports: [TelegrafConfigService, TypeOrmConfigService],
})
export class AppConfigModule {}
