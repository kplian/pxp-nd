import { AccountStatusType } from './AccountStatusType';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm';

@Entity({ schema: 'perp', name: 'taccount_status' })
export class AccountStatus {
  @PrimaryGeneratedColumn({ name: 'account_status_id' })
  accountStatusId?: number;

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
    type: 'integer',
    nullable: true,
    name: 'account_status_type_id'
  })
  accountStatusTypeId?: number;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'related_id'
  })
  relatedId: number;

  @Column({
    type: 'integer',
    nullable: true
  })
  ammount: number;

  @Column({
    type: 'date',
    nullable: true
  })
  date: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true
  })
  description: string;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'branch_id'
  })
  branchId?: number;

  @OneToOne((type) => AccountStatusType)
  @JoinColumn({ name: 'account_status_type_id' })
  accountStatusType?: AccountStatusType;
}
