import * as dotenv from "dotenv";
dotenv.config();

import * as mongoose from "mongoose";
import { createBot } from "./duck.bot";

const initialize = async () => {
  mongoose.connect(process.env.DB_CONNECTION_STRING ?? "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const bot = createBot(process.env.TELEGRAM_TOKEN ?? "");

  bot.launch({ webhook: { domain: process.env.WEBHOOK_DOMAIN, port: Number(process.env.PORT) } });
};

initialize();
