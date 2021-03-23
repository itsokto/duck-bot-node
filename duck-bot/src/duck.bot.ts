import { Telegraf } from "telegraf";
import { DuckSession, DuckSessionDocument, DuckSessionModel } from "./schemas/session";
import { session, SessionContext } from "./session";

export const createBot = (token: string): Telegraf<SessionContext<DuckSession, DuckSessionDocument>> => {
  const bot = new Telegraf<SessionContext<DuckSession, DuckSessionDocument>>(token);
  bot.context.session = new DuckSession();

  // session middleware MUST be initialized
  // before any commands or actions that require sessions
  bot.use(session(DuckSessionModel));

  bot.start((ctx) => ctx.reply(`Try typing @${ctx.botInfo.username} funny cat here.`));

  bot.use(require("./handlers"));

  return bot;
};
