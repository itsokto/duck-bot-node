import { Command, Help, On, Start, Update } from 'nestjs-telegraf';
import { SessionContext } from 'telegraf/typings/session';
import { SessionEntity } from '../storage';
import { CallbackQuery, InlineKeyboardButton, InlineQueryResult } from 'typegram';
import { DuckImage, DuckResponse, DuckStrict } from 'duck-node';
import { ImagesService } from './services/images.service';
import { CallbackData, CallBackDataType } from '@modules/bot/types/callback.data';
import { deserialize, serialize } from 'class-transformer';
import DataCallbackQuery = CallbackQuery.DataCallbackQuery;

@Update()
export class BotUpdate {
  constructor(private readonly _imageService: ImagesService) {}

  @Start()
  async startCommand(ctx: SessionContext<SessionEntity>) {
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

  @Command('strict')
  async strictCommand(ctx: SessionContext<SessionEntity>) {
    await ctx.reply('Select strict filter:', {
      reply_markup: {
        inline_keyboard: [[...generateKeyboard(ctx.session.strict)]],
      },
    });
  }

  @On('callback_query')
  async callbackQuery(ctx: SessionContext<SessionEntity>) {
    const { callbackQuery } = ctx;
    const { data: callbackData } = callbackQuery as DataCallbackQuery;
    const { type, data } = deserialize(CallbackData, callbackData) as { type: CallBackDataType; data: DuckStrict };

    if (type === CallBackDataType.StrictCommand && ctx.session.strict !== data) {
      ctx.session.strict = data;
      await ctx.editMessageReplyMarkup({ inline_keyboard: [[...generateKeyboard(ctx.session.strict)]] });
    }

    await ctx.answerCbQuery();
  }

  @On('inline_query')
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

function* generateKeyboard(defaultValue?: DuckStrict): Generator<InlineKeyboardButton, void> {
  const keys = Object.entries(DuckStrict).filter(([, value]) => typeof value === 'number');

  for (const [key, value] of keys) {
    const data: CallbackData = {
      type: CallBackDataType.StrictCommand,
      data: value,
    };

    yield {
      text: value === defaultValue ? `✅ ${key}` : key,
      callback_data: serialize(data),
    };
  }
}
