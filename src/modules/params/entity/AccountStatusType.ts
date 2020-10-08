import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Unique
} from 'typeorm';

import AccountStatus from './AccountStatus';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ schema: 'params', name: 'taccount_status_type' })
@Unique('code_index_unique', ['code']) // one field

export default class AccountStatusType extends PxpEntity {

  @PrimaryGeneratedColumn({name:'account_status_type_id'})
  accountStatusTypeId: number;

  @Column({name:'code', type:'varchar', length: 50, nullable: false })
  code: string;

  @Column({name:'name', type:'varchar', length: 200, nullable: true })
  name: string;

  @Column({name:'table_name', type:'varchar', length: 80, nullable: true })
  tableName: string;

  @Column({name:'key_name', type:'varchar', length: 80, nullable: true })
  keyName: string;

  @Column({name:'type', type:'varchar', length: 15, nullable: true })
  type: string;

  @OneToMany('AccountStatus', (post: AccountStatus) => post.accountStatusId, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  posts: AccountStatus[];
}
