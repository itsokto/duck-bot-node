import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { DuckStrict } from 'duck-node';

@Entity('sessions')
export class SessionEntity {
  @Index({ unique: true })
  @PrimaryColumn({ type: 'varchar', length: 50 })
  key!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  query?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  vqd?: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  next?: string;

  @Column({ default: DuckStrict.Off })
  strict!: DuckStrict;
}
