import { SessionStore } from 'telegraf/typings/session';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SessionData, omitKeys } from '@modules/storage/stores';
import { SessionEntity } from '@modules/storage';

export class RedisStore<T extends SessionData> implements SessionStore<T> {
  constructor(@Inject(CACHE_MANAGER) private _cacheManager: Cache) {}

  get(name: string): Promise<T | undefined> {
    return this._cacheManager.get(name);
  }

  set(name: string, value: T): Promise<any> {
    for (const omitKey of omitKeys) {
      delete value[omitKey];
    }

    return this._cacheManager.set(name, value);
  }

  delete(name: string): Promise<any> {
    return this._cacheManager.del(name);
  }
}

@Injectable()
export class TelegramSessionStore extends RedisStore<SessionEntity> {}
