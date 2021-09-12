import { Context, MiddlewareFn, session } from 'telegraf';
import { SessionContext, SessionStore } from 'telegraf/typings/session';

const getSessionKey = async (ctx: Context): Promise<string | undefined> => {
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
};

type SessionOptions<S> = {
  getSessionKey?: (ctx: Context) => Promise<string | undefined>;
  store?: SessionStore<S>;
};

export const telegrafSession = <S extends Record<string, any>>(
  options?: SessionOptions<S>,
): MiddlewareFn<SessionContext<S>> => {
  options ??= {};
  options.getSessionKey ??= getSessionKey;

  return session(options);
};
