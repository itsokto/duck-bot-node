import { DuckApi, DuckImage, DuckResponse } from "duck-node";
import { Composer } from "telegraf";
import { InlineQueryResult } from "telegraf/typings/core/types/typegram";
import { DuckContext } from "../duck.bot";
import { DuckSession } from "../schemas/session";
import { ImagesService } from "../services/images.service";

const duckApi = new DuckApi();
const imagesService = new ImagesService(duckApi);

const composer = Composer.on<DuckContext, "inline_query">(
  "inline_query",
  async (ctx) => {
    const { inlineQuery, session } = ctx;

    if (!inlineQuery.query) {
      await ctx.answerInlineQuery(Array<InlineQueryResult>());
      return;
    }

    const response = await imagesService.getImages(inlineQuery.query, session);

    if (!response.results) {
      await ctx.answerInlineQuery(Array<InlineQueryResult>());
      return;
    }

    const inlineQueryResults = imagesService.mapToInlineQueryResults(response.results);

    const nextOffset = response.next ? getNextOffset(inlineQuery.offset, inlineQueryResults.length) : "";

    assignSession(session, response);

    await ctx.answerInlineQuery(inlineQueryResults, {
      next_offset: nextOffset,
    });
  },
);

function getNextOffset(inlineQueryOffset: string, inlineQueryResults: number): string {
  let queryOffset = parseInt(inlineQueryOffset, 10);
  if (isNaN(queryOffset)) {
    queryOffset = 0;
  }

  return (queryOffset + inlineQueryResults).toString();
}

function assignSession(session: DuckSession, response: DuckResponse<DuckImage>): void {
  session.next = response.next;
  session.vqd = response.vqd[response.queryEncoded];
  session.query = response.query;
}

module.exports = composer;
