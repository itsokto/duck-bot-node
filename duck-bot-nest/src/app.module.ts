import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, TelegrafConfigService, TypeOrmConfigService } from '@modules/app-config';
import { BotModule } from '@modules/bot';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useExisting: TypeOrmConfigService,
    }),
    TelegrafModule.forRootAsync({
      imports: [AppConfigModule, BotModule],
      useExisting: TelegrafConfigService,
    }),
  ],
})
export class AppModule {}
