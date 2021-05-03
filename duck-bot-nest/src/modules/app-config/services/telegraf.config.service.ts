import { Environment, EnvironmentConfig } from '@common/types/environment.config';
import { getSessionKey } from '../../../middlewares/session.middleware';
import { Injectable } from '@nestjs/common';
import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { session, Telegraf } from 'telegraf';
import { TelegramSessionStorage } from '@modules/storage';
import { BotModule } from '@modules/bot';

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
    const devLaunchOptions: Telegraf.LaunchOptions = {};
    const launchOptions: Telegraf.LaunchOptions = env === Environment.Production ? prodLaunchOptions : devLaunchOptions;

    return {
      token: this._configService.get<string>('TELEGRAM_TOKEN'),
      include: [BotModule],
      launchOptions: launchOptions,
      middlewares: [session({ store: this._storage, getSessionKey: getSessionKey })],
    };
  }
}
