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
 * Last modified  : 2020-09-18 14:18:09
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, JoinTable } from 'typeorm';
import Subsystem from './Subsystem';
import UiTransaction from './UiTransaction';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tsec_transaction' })
export default class Transaction extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'code', type: 'varchar', length: 200, nullable: true })
  code: string

  @Column({ name: 'description', type: 'text' })
  description: string

  @ManyToOne(() => Subsystem, subsystem => subsystem.transactions)
  @JoinColumn({ name: 'transaction_id' })
  subsystem: Subsystem;

  @OneToMany(() => UiTransaction, uiTransaction => uiTransaction.transaction)
  @JoinTable()
  uis: UiTransaction[];

}