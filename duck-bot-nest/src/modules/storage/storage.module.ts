import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { TypeOrmStorage } from '@middlewares/session.middleware';
import { Repository } from 'typeorm';

@Injectable()
export class TelegramSessionStorage extends TypeOrmStorage<SessionEntity> {
  constructor(@InjectRepository(SessionEntity) _repository: Repository<SessionEntity>) {
    super(_repository);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [TelegramSessionStorage],
  exports: [TypeOrmModule, TelegramSessionStorage],
})
export class StorageModule {}
