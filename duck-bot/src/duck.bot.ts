import * as mongoose from "mongoose";
import { FilterQuery, UpdateQuery } from "mongoose";

import { Context, MiddlewareFn, Telegraf } from "telegraf";
import { DuckSession, SessionDocument } from "./schemas/session";

export class SessionContext<T, TDoc extends mongoose.Document> extends Context {
  session: T | null;
  model: mongoose.Model<TDoc>;

  async saveSession(key: string, data: T) {
    await this.model.updateOne(
      ({ key } as unknown) as FilterQuery<TDoc>,
      ({ $set: { data } } as unknown) as UpdateQuery<TDoc>,
      { upsert: true }
    );
  }

  async getSession(key: string): Promise<T | null> {
    const session = await this.model.findOne({ key } as FilterQuery<any>);
    return session?.toJSON<T>() ?? null;
  }
}

export const getSessionKey = ({ from, chat }: Context) => {
  if (from == null || chat == null) {
    return null;
  }

  return `${from.id}:${chat.id}`;
};

export function session(): MiddlewareFn<
  SessionContext<DuckSession, SessionDocument>
> {
  return async (ctx, next) => {
    const key = getSessionKey(ctx);

    if (key) {
      ctx.session = await ctx.getSession(key);
    }

    await next();

    if (key && ctx.session) {
      await ctx.saveSession(key, ctx.session);
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
