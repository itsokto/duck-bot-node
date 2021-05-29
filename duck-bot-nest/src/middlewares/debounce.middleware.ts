import { MiddlewareFn } from 'telegraf';
import { SessionContext } from 'telegraf/typings/session';
import { UpdateType } from 'telegraf/typings/telegram-types';

const callbacks = new Map<string, NodeJS.Timeout>();

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

    deleteCallback(key);
    createCallback(key, next, debounceTime);
  };
}

function createCallback(key: string, fn: () => Promise<void>, debounceTime: number): void {
  const timeOut = setTimeout(async () => {
    console.log(key, 'debounce');
    await fn();
    deleteCallback(key);
  }, debounceTime);
  callbacks.set(key, timeOut);
  console.log(key, 'created');
}

function deleteCallback(key: string): void {
  const timeOut = callbacks.get(key);
  if (!timeOut) {
    return;
  }
  clearTimeout(timeOut);
  callbacks.delete(key);
  console.log(key, 'deleted');
}
