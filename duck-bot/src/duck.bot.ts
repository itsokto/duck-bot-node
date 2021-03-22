import { InlineQueryResult } from "telegraf/typings/core/types/typegram";
import * as mongoose from "mongoose";
import { FilterQuery, UpdateQuery } from "mongoose";

import { Context, MiddlewareFn, Telegraf } from "telegraf";
import {
  DuckSession,
  DuckSessionDocument,
  DuckSessionModel,
} from "./schemas/session";
import { InlineQueryResultPhoto } from "typegram";
import { DuckApi, DuckImage, DuckResponse } from "duck-node";
import { AxiosResponse } from "axios";

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
    const { inlineQuery, session } = ctx;

    if (!inlineQuery.query) {
      return;
    }

    let response: AxiosResponse<DuckResponse<DuckImage>>;

    if (session.query === inlineQuery.query && session.vqd && session.next) {
      response = await duckApi.getImagesNext(session.next, session.vqd);
    } else {
      response = await duckApi.getImages(inlineQuery.query);
    }

    const { results, vqd, next, query } = response.data;

    if (!results) {
      await ctx.answerInlineQuery(Array<InlineQueryResult>());
      return;
    }

    const inlineQueryResults = results
      .filter((_, i) => i < 50)
      .map((image, i) => {
        const photoResult: InlineQueryResultPhoto = {
          type: "photo",
          id: i.toString(),
          photo_url: image.image,
          thumb_url: image.thumbnail,
        };
        return photoResult;
      });

    inlineQuery.offset ??= "0";

    const offset = next
      ? (inlineQueryResults.length + parseInt(inlineQuery.offset)).toString()
      : "";

    await ctx.answerInlineQuery(inlineQueryResults, {
      next_offset: offset,
    });

    session.next = next;
    session.vqd = vqd;
    session.query = query;
  });

  return bot;
};
