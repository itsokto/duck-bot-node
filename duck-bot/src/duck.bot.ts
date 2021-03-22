import * as mongoose from "mongoose";
import { FilterQuery, UpdateQuery } from "mongoose";

import { Context, MiddlewareFn, Telegraf } from "telegraf";
import {
  DuckSession,
  DuckSessionDocument,
  DuckSessionModel,
} from "./schemas/session";
import { InlineQueryResultPhoto } from "typegram";
import { DuckApi, DuckImage } from "duck-node";

export interface Session {
  key: string;
}

export interface SessionDocument extends mongoose.Document {}

export class SessionContext<
  T extends Session,
  TDoc extends SessionDocument
> extends Context {
  session: T;
}

export const getSessionKey = ({ from, chat }: Context) => {
  if (from == null || chat == null) {
    return null;
  }

  return `${from.id}:${chat.id}`;
};

export function session<T extends Session, TDoc extends SessionDocument>(
  model: mongoose.Model<TDoc>
): MiddlewareFn<SessionContext<T, TDoc>> {
  const saveSession = (key: string, data: T) =>
    model.findOneAndUpdate(
      ({ key } as unknown) as FilterQuery<TDoc>,
      (data as unknown) as UpdateQuery<TDoc>,
      { upsert: true, strict: true }
    );

  const getSession = async (key: string) => {
    const session = await model.findOne(({
      key,
    } as unknown) as FilterQuery<TDoc>);
    return session?.toJSON<T>();
  };

  return async (ctx, next) => {
    const key = getSessionKey(ctx);

    if (key) {
      ctx.session.key = key;
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

export const createBot = (token: string, apiBaseUrl: string) => {
  const bot = new Telegraf<SessionContext<DuckSession, DuckSessionDocument>>(
    token
  );
  bot.context.session = new DuckSession();

  const duckApi = new DuckApi(apiBaseUrl);

  // session middleware MUST be initialized
  // before any commands or actions that require sessions
  bot.use(session(DuckSessionModel));

  bot.command("/testctx", async (ctx) => {
    ctx.session.query = "test";
    await ctx.reply(`Inline keyboard with callback ${ctx.session.query}`);
  });

  bot.on("inline_query", async (ctx) => {
    const response = await duckApi.getImages(ctx.inlineQuery.query);
    const answer = response.data.results.map((image: DuckImage, i: number) => {
      const inlineAnswer: InlineQueryResultPhoto = {
        type: "photo",
        id: i.toString(),
        photo_url: image.url,
        thumb_url: image.thumbnail,
      };
      return inlineAnswer;
    });

    await ctx.answerInlineQuery(answer);
  });

  return bot;
};
