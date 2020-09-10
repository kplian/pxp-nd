import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Transaction } from 'typeorm';
import Role from './Role';
import transaction from './Transaction';

@Entity({ name: 'tsec_subsystem' })

export default class Subsystem  {

  @PrimaryGeneratedColumn({ name: 'subsystem_id' })
  subsystemId: number;

  @Column({ name: 'code', type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ name: 'folder_name', type: 'varchar', length: 50, nullable: true })
  folderName: string;

  @Column({ name: 'prefix', type: 'varchar', length: 10, nullable: true })
  prefix: string;

  @OneToMany(() => transaction, transaction => transaction.subsystem  )
  transactions: transaction[];

  @OneToMany(() => Role, role => role.subsystem)
  roles: Role[];

} 