import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { TelegramSessionStore } from '@modules/storage/stores/redis.store';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [TelegramSessionStore],
  exports: [TypeOrmModule, TelegramSessionStore],
})
export class StorageModule {}
