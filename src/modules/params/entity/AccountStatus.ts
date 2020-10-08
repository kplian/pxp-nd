import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Unique,
  OneToOne,
  ManyToOne
} from 'typeorm';

import { PxpEntity } from '../../../lib/pxp';

import AccountStatusType from './../entity/AccountStatusType';


@Entity({ schema: 'params', name: 'taccount_status' })

export default class AccountStatus extends PxpEntity {

  @PrimaryGeneratedColumn({name:'account_status_id'})
  accountStatusId: number;

  @Column({ name: 'table_id', type: 'integer', nullable: false })
  tableId: number;

  @Column({ name: 'amount', type: 'numeric', nullable: false })
  amount: number;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({
    name: 'account_status_type_id',
    type: 'integer',
    nullable: false
  })
  accountStatusTypeId: number;

  @ManyToOne(() => AccountStatusType, (accountStatusType: AccountStatusType) => accountStatusType.posts , {
    eager: true,
    cascade: true
  })
  @JoinColumn({ name: 'account_status_type_id' })
  accountStatusType: AccountStatusType;

}
