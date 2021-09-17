import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@common/types/environment.config';
import * as redisStore from 'cache-manager-ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory {
  constructor(private _configService: ConfigService<EnvironmentConfig>) {}

  createCacheOptions(): CacheModuleOptions {
    const redis = new Redis(this._configService.get('REDIS_URL'));
    return {
      store: redisStore,
      redisInstance: redis,
      ttl: 5000,
    };
  }
}
