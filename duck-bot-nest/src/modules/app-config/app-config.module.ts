import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageModule } from '@modules/storage';
import { TelegrafConfigService } from './services/telegraf.config.service';
import { TypeOrmConfigService } from './services/typeorm.config.service';
import { RedisConfigService } from './services/redis.config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from '@modules/bot';
import { TelegramSessionStore } from '@modules/storage/stores/redis.store';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useExisting: TypeOrmConfigService,
    }),
    CacheModule.registerAsync({
      imports: [AppConfigModule],
      useExisting: RedisConfigService,
    }),
    TelegrafModule.forRootAsync({
      imports: [AppConfigModule, BotModule],
      useExisting: TelegrafConfigService,
    }),
  ],
  providers: [TelegrafConfigService, TypeOrmConfigService, ConfigService, TelegramSessionStore],
  exports: [TelegrafConfigService, TypeOrmConfigService],
})
export class AppConfigModule {}
