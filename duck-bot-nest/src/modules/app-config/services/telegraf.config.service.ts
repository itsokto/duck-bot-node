import { Environment, EnvironmentConfig } from '@common/types/environment.config';
import { Injectable } from '@nestjs/common';
import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { TelegramSessionStorage } from '@modules/storage';
import { BotModule } from '@modules/bot';
import { telegrafSession } from '@middlewares/session.middleware';
import { telegrafDebounce } from '@middlewares/debounce.middleware';

@Injectable()
export class TelegrafConfigService implements TelegrafOptionsFactory {
  constructor(private _configService: ConfigService<EnvironmentConfig>, private _storage: TelegramSessionStorage) {}

  createTelegrafOptions(): TelegrafModuleOptions {
    const env = this._configService.get<Environment>('NODE_ENV', Environment.Development);

    const prodLaunchOptions: Telegraf.LaunchOptions = {
      webhook: {
        domain: this._configService.get<string>('TELEGRAM_WEBHOOK_DOMAIN'),
        port: this._configService.get<number>('PORT'),
      },
    };
    const devLaunchOptions: Telegraf.LaunchOptions = { dropPendingUpdates: true };
    const launchOptions: Telegraf.LaunchOptions = env === Environment.Production ? prodLaunchOptions : devLaunchOptions;

    return {
      token: this._configService.get<string>('TELEGRAM_TOKEN'),
      include: [BotModule],
      launchOptions: launchOptions,
      middlewares: [telegrafDebounce(1500, 'inline_query'), telegrafSession({ store: this._storage })],
    };
  }
}
