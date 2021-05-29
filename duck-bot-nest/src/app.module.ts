import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from '@modules/app-config';

@Module({
  imports: [ConfigModule.forRoot({ cache: true }), AppConfigModule],
})
export class AppModule {}
