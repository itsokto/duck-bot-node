import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageModule } from '@modules/storage';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from '@modules/bot';
import { TelegramSessionStore } from '@modules/storage/stores/redis.store';
import { TelegrafConfigService } from '@modules/app-config/services';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    TelegrafModule.forRootAsync({
      imports: [AppConfigModule, StorageModule, BotModule],
      useExisting: TelegrafConfigService,
    }),
  ],
  providers: [TelegrafConfigService, ConfigService, TelegramSessionStore],
  exports: [TelegrafConfigService],
})
export class AppConfigModule {}
