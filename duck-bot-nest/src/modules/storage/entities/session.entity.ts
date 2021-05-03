import { Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';
import { DuckStrict } from 'duck-node';

@Entity('sessions')
@Unique('key', ['key'])
export class SessionEntity {
  @Index({ unique: true })
  @PrimaryColumn({ type: 'varchar', length: 50 })
  key: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  query: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  vqd: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  next: string;

  @Column({ default: DuckStrict.Off })
  strict: DuckStrict;
}
