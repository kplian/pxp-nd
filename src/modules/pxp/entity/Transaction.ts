import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, JoinTable } from 'typeorm';
import Subsystem from './Subsystem';
import UiTransaction from './UiTransaction';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tsec_transaction' })
export default class Transaction extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'code', type: 'varchar', length: 200, nullable: true })
  code: string

  @Column({ name: 'description', type: 'text' })
  description: string

  @ManyToOne(() => Subsystem, subsystem => subsystem.transactions)
  @JoinColumn({ name: 'procedure_id' })
  subsystem: Subsystem;

  @OneToMany(() => UiTransaction, uiTransaction => uiTransaction.transaction)
  @JoinTable()
  uis: UiTransaction[];

}