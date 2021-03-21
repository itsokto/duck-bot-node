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

  bot.launch({ webhook: { hookPath: "/updates", port: 5000 } });
};

initialize();
