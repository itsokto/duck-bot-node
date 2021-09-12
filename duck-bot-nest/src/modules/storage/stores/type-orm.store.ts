import { SessionStore } from 'telegraf/typings/session';
import { Repository } from 'typeorm';
import { key, KeyColumn, omitKeys } from '@modules/storage/stores';
import { Injectable } from '@nestjs/common';
import { SessionEntity } from '@modules/storage';
import { InjectRepository } from '@nestjs/typeorm';

export class TypeOrmStore<T extends Pick<T, KeyColumn>> implements SessionStore<T> {
  constructor(private _repository: Repository<T>) {}

  get(name: string): Promise<T | undefined> {
    return this._repository.findOne(name);
  }

  set(name: string, value: T): Promise<any> {
    if (!value?.key) {
      value.key = name;
    }

    const keys = Object.entries(value).flatMap(([key, value]) => (value && !omitKeys.includes(key) ? [key] : []));

    return this._repository
      .createQueryBuilder()
      .insert()
      .values(value as any)
      .orUpdate({
        conflict_target: [key],
        overwrite: keys,
      })
      .execute();
  }

  delete(name: string): Promise<any> {
    return this._repository.delete(name);
  }
}

@Injectable()
export class TelegramSessionStore extends TypeOrmStore<SessionEntity> {
  constructor(@InjectRepository(SessionEntity) _repository: Repository<SessionEntity>) {
    super(_repository);
  }
}
