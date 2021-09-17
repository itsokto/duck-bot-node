import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@common/types/environment.config';
import * as redisStore from 'cache-manager-ioredis';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory {
  constructor(private _configService: ConfigService<EnvironmentConfig>) {}

  createCacheOptions(): CacheModuleOptions {
    return {
      store: redisStore,
      url: this._configService.get('REDIS_URL'),
      ttl: 5000,
    };
  }
}
