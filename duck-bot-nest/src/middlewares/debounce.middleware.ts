import { MiddlewareFn } from 'telegraf';
import { SessionContext } from 'telegraf/typings/session';
import { UpdateType } from 'telegraf/typings/telegram-types';

type DebounceCallback = { update_id: number; timeout: NodeJS.Timeout };

const callbacks = new Map<string, DebounceCallback>();

export function telegrafDebounce<TSession extends Record<string, unknown>>(
  debounceTime = 1000,
  ...updateTypes: UpdateType[]
): MiddlewareFn<SessionContext<TSession>> {
  return async (ctx, next) => {
    // debounce on all updates if no updateTypes specified
    if (updateTypes.length > 0 && !updateTypes.includes(ctx.updateType)) {
      await next();
      return;
    }

    const key = `${ctx.from.id}:${ctx.updateType}`;
    const update_id = ctx.update.update_id;

    // ensure debounce on latest update
    if (!canModify(key, update_id)) {
      console.log(key, 'received old update');
      return;
    }

    deleteCallback(key);
    createCallback(key, update_id, next, debounceTime);
  };
}

function canModify(key: string, update_id: number): boolean {
  return callbacks.get(key)?.update_id < update_id;
}

function createCallback(key: string, update_id: number, fn: () => Promise<void>, debounceTime: number): void {
  const timeOut = setTimeout(async () => {
    console.log(key, 'debounce');
    await fn();
    deleteCallback(key);
  }, debounceTime);

  callbacks.set(key, { update_id: update_id, timeout: timeOut });
  console.log(key, 'created');
}

function deleteCallback(key: string): void {
  const debounceCallback = callbacks.get(key);
  if (!debounceCallback) {
    return;
  }

  clearTimeout(debounceCallback.timeout);
  callbacks.delete(key);
  console.log(key, 'deleted');
}