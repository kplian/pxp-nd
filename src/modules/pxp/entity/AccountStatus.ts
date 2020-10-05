/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Person Controller
 *
 * @summary Account Status Entity
 * @author Favio Figueroa
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  :
 */
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

import AccountStatusType from './AccountStatusType';


@Entity({ name: 'taccount_status' })

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
