import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegramError } from 'telegraf';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter<TelegramError> {
  private readonly _logger = new Logger(TelegrafExceptionFilter.name);

  async catch(exception: TelegramError): Promise<void> {
    this._logger.error(exception);
  }
}
