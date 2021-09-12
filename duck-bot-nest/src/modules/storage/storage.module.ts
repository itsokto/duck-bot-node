import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, TypeOrmConfigService } from '@modules/app-config';
import { RedisConfigService } from '@modules/app-config/services/redis.config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useExisting: TypeOrmConfigService,
    }),
    CacheModule.registerAsync({
      imports: [AppConfigModule],
      useExisting: RedisConfigService,
    }),
  ],
  providers: [ConfigService, TypeOrmConfigService, RedisConfigService],
  exports: [TypeOrmModule, CacheModule],
})
export class StorageModule {}
