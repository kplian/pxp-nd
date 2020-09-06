import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, JoinTable } from 'typeorm';
import Procedure from './Procedure';
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

  @ManyToOne(() => Procedure, procedure => procedure.transactions)
  @JoinColumn({ name: 'procedure_id' })
  procedure: Procedure;

  @OneToMany(() => UiTransaction, uiTransaction => uiTransaction.transaction)
  @JoinTable()
  uis: UiTransaction[];

}