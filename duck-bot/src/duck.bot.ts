import { InlineQueryResult } from "telegraf/typings/core/types/typegram";
import { Telegraf } from "telegraf";
import {
  DuckSession,
  DuckSessionDocument,
  DuckSessionModel,
} from "./schemas/session";
import { DuckApi } from "duck-node";
import { ImagesService } from "./services/images.service";
import { session, SessionContext } from "./session";

export const createBot = (token: string, apiBaseUrl: string) => {
  const bot = new Telegraf<SessionContext<DuckSession, DuckSessionDocument>>(
    token
  );
  bot.context.session = new DuckSession();

  const duckApi = new DuckApi();
  const imagesService = new ImagesService(duckApi);

  // session middleware MUST be initialized
  // before any commands or actions that require sessions
  bot.use(session(DuckSessionModel));

  bot.start(async (ctx) => {
    await ctx.reply(`Try typing ${ctx.botInfo.username} funny cat here.`);
  });

  bot.on("inline_query", async (ctx) => {
    const { inlineQuery, session } = ctx;

    if (!inlineQuery.query) {
      return;
    }

    const response = await imagesService.getImages(inlineQuery, session);

    const { results, vqd, next, query, queryEncoded } = response;

    if (!results) {
      await ctx.answerInlineQuery(Array<InlineQueryResult>());
      return;
    }

    const inlineQueryResults = imagesService.mapToInlineQueryResults(
      results.filter((_, i) => i < 50)
    );

    let queryOffset = parseInt(inlineQuery.offset, 10);
    if (isNaN(queryOffset)) {
      queryOffset = 0;
    }

    const offset = (inlineQueryResults.length + queryOffset).toString();
    const nextOffset = next ? offset : "";

    session.next = next;
    session.vqd = vqd[queryEncoded];
    session.query = query;

    await ctx.answerInlineQuery(inlineQueryResults, {
      next_offset: nextOffset,
    });
  });

  return bot;
};
