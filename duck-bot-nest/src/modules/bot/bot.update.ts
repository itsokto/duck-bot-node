import { Command, Help, On, Start, Update } from 'nestjs-telegraf';
import { SessionContext } from 'telegraf/typings/session';
import { SessionEntity } from '../storage';
import { CallbackQuery, InlineKeyboardButton } from 'typegram';
import { DuckImage, DuckResponse, DuckStrict } from 'duck-node';
import { ImagesService } from './services/images.service';
import { CallbackData, CallBackDataType } from '@modules/bot/types/callback.data';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import DataCallbackQuery = CallbackQuery.DataCallbackQuery;
import { UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from '@common/filters/telegraf-exception.filter';

@Update()
@UseFilters(TelegrafExceptionFilter)
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
        inline_keyboard: [[...generateKeyboard(ctx.session?.strict)]],
      },
    });
  }

  @Command('donate')
  async donateCommand(ctx: SessionContext<SessionEntity>) {
    await ctx.reply('You can support me by following any of the links below. Thank you!', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '☕ Ko-fi', url: 'https://ko-fi.com/duckpicsbot' },
            { text: '🟠 Patreon', url: 'https://patreon.com/duckpicsbot' },
          ],
        ],
      },
    });
  }

  @On('callback_query')
  async callbackQuery(ctx: SessionContext<SessionEntity>) {
    const { callbackQuery, session } = ctx;

    if (!session) {
      return;
    }

    const { type, data } = plainToInstance(CallbackData, JSON.parse((callbackQuery as DataCallbackQuery)?.data));

    if (type === CallBackDataType.StrictCommand && session.strict !== data) {
      session.strict = data;
      await ctx.editMessageReplyMarkup({ inline_keyboard: [[...generateKeyboard(session.strict)]] });
    }

    await ctx.answerCbQuery();
  }

  @On('inline_query')
  async inlineQuery(ctx: SessionContext<SessionEntity>) {
    const { inlineQuery, session } = ctx;

    if (!inlineQuery?.query || !session) {
      await ctx.answerInlineQuery([]);
      return;
    }

    const response = await this._imageService.getImages(inlineQuery.query, session);

    if (!response.results) {
      await ctx.answerInlineQuery([]);
      return;
    }

    const inlineQueryResults = this._imageService.mapToInlineQueryResults(response.results);

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
    const data: CallbackData<DuckStrict> = {
      type: CallBackDataType.StrictCommand,
      data: value as DuckStrict,
    };

    yield {
      text: value === defaultValue ? `✅ ${key}` : key,
      callback_data: JSON.stringify(instanceToPlain(data)),
    };
  }
}
