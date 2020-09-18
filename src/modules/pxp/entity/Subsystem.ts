/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * long description for the file
 *
 * @summary short description for the file
 * @author No author
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-09-18 13:50:04
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Role from './Role';
import Transaction from './Transaction';
import Ui from './Ui';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tsec_subsystem' })
export default class Subsystem extends PxpEntity {

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

  @OneToMany(() => Transaction, transaction => transaction.subsystem)
  transactions: Transaction[];

  @OneToMany(() => Role, role => role.subsystem)
  roles: Role[];

  @OneToMany(() => Ui, ui => ui.subsystem)
  uis: Ui[];

}