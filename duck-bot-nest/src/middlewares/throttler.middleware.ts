import { Environment } from '@common/types/environment.config';
import telegrafThrottler from 'telegraf-throttler';
import { Context, Middleware } from 'telegraf';

export function throttler(env: Environment = Environment.Development): Middleware<Context> {
  const defaultErrorHandler = async (ctx, next, error) => {
    if (env === Environment.Development) {
      return console.warn(`Inbound ${ctx.from?.id || ctx.chat?.id} | ${error.message}`);
    }
  };

  return telegrafThrottler({
    in: {
      highWater: 1, // Queue length
      maxConcurrent: 1, // Only 1 job at a time
      minTime: 1000, // Wait this many milliseconds to be ready, after a job
    },
    inThrottlerError: defaultErrorHandler,
  });
}
