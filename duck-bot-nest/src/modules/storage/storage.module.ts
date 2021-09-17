import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmConfigService, RedisConfigService } from '@modules/storage/services';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [StorageModule],
      useExisting: TypeOrmConfigService,
    }),
    CacheModule.registerAsync({
      imports: [StorageModule],
      useExisting: RedisConfigService,
    }),
  ],
  providers: [ConfigService, TypeOrmConfigService, RedisConfigService],
  exports: [TypeOrmModule, CacheModule, TypeOrmConfigService, RedisConfigService],
})
export class StorageModule {}
