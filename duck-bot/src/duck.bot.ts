import * as mongoose from "mongoose";
import { FilterQuery, UpdateQuery } from "mongoose";

import { Context, MiddlewareFn, Telegraf } from "telegraf";
import { DuckSession, SessionDocument } from "./schemas/session";

export interface SessionContext<T, TDoc extends mongoose.Document>
  extends Context {
  session: T | null;
  model: mongoose.Model<TDoc>;
}

export const getSessionKey = ({ from, chat }: Context) => {
  if (from == null || chat == null) {
    return null;
  }

  return `${from.id}:${chat.id}`;
};

export function session<
  T,
  TDoc extends mongoose.Document = mongoose.Document
>(): MiddlewareFn<SessionContext<T, TDoc>> {
  const saveSession = (key: string, ctx: SessionContext<T, TDoc>) =>
    ctx.model.updateOne(
      ({ key } as unknown) as FilterQuery<TDoc>,
      ({ $set: { ctx } } as unknown) as UpdateQuery<TDoc>,
      { upsert: true }
    );

  const getSession = async (key: string, ctx: SessionContext<T, TDoc>) => {
    const session = await ctx.model.findOne({ key } as FilterQuery<any>);
    return session?.toJSON<T>() ?? null;
  };

  return async (ctx, next) => {
    const key = getSessionKey(ctx);

    if (key) {
      ctx.session = await getSession(key, ctx);
    }

    await next();

    if (key && ctx.session) {
      await saveSession(key, ctx);
    }
  };
}

export const createBot = (token: string) => {
  const bot = new Telegraf<SessionContext<DuckSession, SessionDocument>>(token);

  // session middleware MUST be initialized
  // before any commands or actions that require sessions
  bot.use(session());

  bot.command("/testctx", async (ctx) => {
    ctx.session ??= new DuckSession();
    ctx.session.query = "test";
    await ctx.reply(`Inline keyboard with callback ${ctx.session.query}`);
  });

  return bot;
};
