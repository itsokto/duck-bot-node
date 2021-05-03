import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, EnvironmentConfig } from '@common/types/environment.config';
import { SessionEntity } from '@modules/storage';
import { LoggerOptions } from 'typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly _configService: ConfigService<EnvironmentConfig>) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const env = this._configService.get<Environment>('NODE_ENV', Environment.Development);
    const logger: LoggerOptions = env === Environment.Production ? false : ['query'];

    return {
      type: 'postgres',
      url: this._configService.get<string>('DB_CONNECTION_STRING'),
      entities: [SessionEntity],
      ssl: { rejectUnauthorized: false },
      synchronize: false,
      migrations: ['dist/migrations/*.{ts,js}'],
      logging: logger,
    };
  }
}
