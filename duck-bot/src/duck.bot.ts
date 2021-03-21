import * as mongoose from "mongoose";
import { FilterQuery, UpdateQuery } from "mongoose";

import { Context, MiddlewareFn, Telegraf, Telegram } from "telegraf";
import { Update, UserFromGetMe } from "telegraf/typings/core/types/typegram";
import {
  DuckSession,
  DuckSessionDocument,
  DuckSessionModel,
} from "./schemas/session";

export class Session {
  key: string;
}

export interface SessionDocument<T extends Session>
  extends mongoose.Document<T> {}

export class SessionContext<
  T extends Session,
  TDoc extends SessionDocument<T>
> extends Context {
  session: T;
}

export const getSessionKey = ({ from, chat }: Context) => {
  if (from == null || chat == null) {
    return null;
  }

  return `${from.id}:${chat.id}`;
};

export function session<T extends Session, TDoc extends SessionDocument<T>>(
  model: mongoose.Model<TDoc>
): MiddlewareFn<SessionContext<T, TDoc>> {
  const saveSession = (key: string, data: T) =>
    model.findOneAndUpdate(
      ({ key } as unknown) as FilterQuery<TDoc>,
      ({ $set: { data } } as unknown) as UpdateQuery<TDoc>,
      { upsert: true }
    );

  const getSession = async (key: string) => {
    const session = await model.findOne(({
      key,
    } as unknown) as FilterQuery<TDoc>);
    return session?.toJSON<T>() ?? null;
  };

  return async (ctx, next) => {
    const key = getSessionKey(ctx);

    if (key) {
      if (!ctx.session) {
        ctx.session = activator(ctx.session);
      }

      const session = await getSession(key);
      if (session) {
        ctx.session = session;
      }
    }

    await next();

    if (key) {
      await saveSession(key, ctx.session);
    }
  };
}

function activator<T extends Session>(type: { new (): T }): T {
  return new type();
}

export const createBot = (token: string) => {
  const bot = new Telegraf<SessionContext<DuckSession, DuckSessionDocument>>(
    token
  );

  // session middleware MUST be initialized
  // before any commands or actions that require sessions
  bot.use(session(DuckSessionModel));

  bot.command("/testctx", async (ctx) => {
    ctx.session.query = "test";
    await ctx.reply(`Inline keyboard with callback ${ctx.session.query}`);
  });

  return bot;
};
