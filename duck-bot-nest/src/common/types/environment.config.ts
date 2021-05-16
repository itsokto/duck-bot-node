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
  DB_CONNECTION_STRING: string;
  PORT?: number;
  PROXY?: string;
}
