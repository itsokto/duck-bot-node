import { MiddlewareFn } from 'telegraf';
import { SessionContext } from 'telegraf/typings/session';
import { UpdateType } from 'telegraf/typings/telegram-types';

type DebounceCallback = { update_id: number; timeout: NodeJS.Timeout };

const callbacks = new Map<string, DebounceCallback>();

export const telegrafDebounce =
  <TSession extends Record<string, unknown>>(
    debounceTime = 1000,
    ...updateTypes: UpdateType[]
  ): MiddlewareFn<SessionContext<TSession>> =>
  async (ctx, next) => {
    const {
      from,
      updateType,
      update: { update_id },
    } = ctx;

    // debounce on all updates if no updateTypes specified
    if (!from || !updateTypes?.includes(updateType)) {
      await next();
      return;
    }

    const key = `${from.id}:${updateType}`;

    // ensure debounce on latest update
    if (!canModify(key, update_id)) {
      console.log('[Debounce Middleware]', key, 'received old update', update_id);
      return;
    }

    deleteCallback(key);
    createCallback(key, update_id, next, debounceTime);
  };

const canModify = (key: string, update_id: number): boolean => {
  const callback = callbacks.get(key);

  if (!callback) {
    return true;
  }

  return callback.update_id < update_id;
};

const createCallback = (key: string, update_id: number, fn: () => Promise<void>, debounceTime: number): void => {
  const timeOut = setTimeout(async () => {
    await fn();
    deleteCallback(key);
  }, debounceTime);

  callbacks.set(key, { update_id: update_id, timeout: timeOut });
};

const deleteCallback = (key: string): void => {
  const callback = callbacks.get(key);

  if (!callback) {
    return;
  }

  clearTimeout(callback.timeout);
  callbacks.delete(key);
};
