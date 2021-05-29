export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

export interface EnvironmentConfig {
  NODE_ENV?: Environment;
  TELEGRAM_TOKEN: string;
  TELEGRAM_WEBHOOK_DOMAIN?: string;
  DATABASE_URL: string;
  PORT?: number;
  PROXY?: string;
}
