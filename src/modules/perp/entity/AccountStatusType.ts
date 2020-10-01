import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm';

@Entity({ schema: 'perp', name: 'taccount_status_type' })
export class AccountStatusType {
  @PrimaryGeneratedColumn({ name: 'account_status_type_id' })
  accountStatusTypeId?: number;

  @Column({
    name: 'user_ins',
    type: 'varchar',
    length: 50,
    nullable: true
  })
  userIns?: string;

  @Column({
    name: 'user_upd',
    type: 'varchar',
    length: 50,
    nullable: true
  })
  userUpd?: string;

  @Column({
    name: 'user_interim_ins',
    type: 'varchar',
    nullable: true
  })
  userInterimIns?: string;

  @Column({
    name: 'user_interim_upd',
    type: 'varchar',
    nullable: true
  })
  userInterimUpd?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  status?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  name: string;

  @Column({
    name: 'table_name',
    type: 'varchar',
    length: 80,
    nullable: true
  })
  tableName: string;

  @Column({
    name: 'key_name',
    type: 'varchar',
    length: 80,
    nullable: true
  })
  keyName: string;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true
  })
  type: string;
}
