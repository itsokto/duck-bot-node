import { Repository } from 'typeorm';
import { SessionStore, SessionContext } from 'telegraf/typings/session';
import { Context, MiddlewareFn, session } from 'telegraf';

type KeyColumn = 'key';
const key: KeyColumn = 'key';
const omitKeys = [key, '__scenes'];

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

async function getSessionKey(ctx: Context): Promise<string> {
  const fromId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!fromId) {
    return undefined;
  }

  if (ctx.updateType === 'inline_query' || ctx.updateType === 'callback_query') {
    return `${fromId}:${fromId}`;
  }

  if (!chatId) {
    return undefined;
  }

  return `${fromId}:${chatId}`;
}

type SessionOptions<S> = {
  getSessionKey?: (ctx: Context) => Promise<string | undefined>;
  store?: SessionStore<S>;
};

export function telegrafSession<S extends Record<string, any>>(
  options?: SessionOptions<S>,
): MiddlewareFn<SessionContext<S>> {
  options.getSessionKey ??= getSessionKey;

  return session(options);
}
