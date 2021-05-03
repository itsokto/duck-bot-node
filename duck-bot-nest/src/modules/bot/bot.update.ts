import { Update, Start, Help, Ctx, InlineQuery } from 'nestjs-telegraf';
import { SessionContext } from 'telegraf/typings/session';
import { SessionEntity } from '../storage';
import { InlineQueryResult } from 'typegram';
import { DuckImage, DuckResponse } from 'duck-node';
import { ImagesService } from './services/images.service';

@Update()
export class BotUpdate {
  constructor(private readonly _imageService: ImagesService) {}

  @Start()
  async startCommand(@Ctx() ctx: SessionContext<SessionEntity>) {
    await ctx.reply(`Hi! Try typing @${ctx.botInfo.username} little duck here or press button below.`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Search for little 🦆',
              switch_inline_query_current_chat: 'little duck',
            },
          ],
        ],
      },
    });
  }

  @Help()
  async helpCommand(ctx: SessionContext<SessionEntity>) {
    await ctx.reply(`Just start typing @${ctx.botInfo.username} 'something' in any chat.`);
  }

  @InlineQuery(/.*/)
  async inlineQuery(ctx: SessionContext<SessionEntity>) {
    const { inlineQuery, session } = ctx;

    if (!inlineQuery.query) {
      await ctx.answerInlineQuery([]);
      return;
    }

    const response = await this._imageService.getImages(inlineQuery.query, session);

    if (!response.results) {
      await ctx.answerInlineQuery([]);
      return;
    }

    const inlineQueryResults: readonly InlineQueryResult[] = this._imageService.mapToInlineQueryResults(
      response.results,
    );

    const nextOffset = response.next ? this.getNextOffset(inlineQuery.offset, inlineQueryResults.length) : '';

    this.assignSession(session, response);

    await ctx.answerInlineQuery(inlineQueryResults, {
      next_offset: nextOffset,
    });
  }

  getNextOffset(inlineQueryOffset: string, inlineQueryResults: number): string {
    let queryOffset = parseInt(inlineQueryOffset, 10);
    if (isNaN(queryOffset)) {
      queryOffset = 0;
    }

    return (queryOffset + inlineQueryResults).toString();
  }

  assignSession(session: SessionEntity, response: DuckResponse<DuckImage>): void {
    session.next = response.next;
    session.vqd = response.vqd[response.queryEncoded];
    session.query = response.query;
  }
}
