import { Repository } from 'typeorm';
import { SessionStore } from 'telegraf/typings/session';
import { Context } from 'telegraf';

type KeyColumn = 'key';
const key: KeyColumn = 'key';
const omitKeys = [key, '__scenes'];

export async function getSessionKey(ctx: Context): Promise<string> {
  const fromId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!fromId) {
    return undefined;
  }

  if (ctx.updateType === 'inline_query') {
    return `${fromId}:${fromId}`;
  }

  if (!chatId) {
    return undefined;
  }

  return `${fromId}:${chatId}`;
}

export class TypeOrmStorage<T extends Pick<T, KeyColumn>> implements SessionStore<T> {
  constructor(private _repository: Repository<T>) {}

  get(name: string): Promise<T> {
    return this._repository.findOne(name);
  }

  set(name: string, value: T): Promise<any> {
    if (!value?.key) {
      value.key = name;
    }

    const keys = Object.keys(value).filter((key) => !!value[key] && !omitKeys.includes(key));

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
