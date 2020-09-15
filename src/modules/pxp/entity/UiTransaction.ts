import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import Transaction from './Transaction';
import Ui from './Ui';
import Role from './Role';
import PxpEntity from './PxpEntity';

@Entity({ name: 'tsec_ui_transaction', schema: 'pxp' })
export default class UiTransaction extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'ui_transaction_id' })
  uiTransactionId: number;

  @Column({ name: 'button', type: 'boolean', nullable: false, default: false })
  button: string

  @Column({ name: 'description', type: 'text', nullable: true })
  buttonName: string

  @ManyToOne(() => Ui, ui => ui.transactions)
  @JoinColumn({ name: 'ui_id' })
  ui: Ui;

  @ManyToOne(() => Transaction, transaction => transaction.uis)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToMany(() => Role)
  @JoinTable({
    schema: 'pxp',
    name: 'tsec_ui_transaction_role',
    joinColumn: {
      name: 'ui_transaction_id',
      referencedColumnName: 'uiTransactionId'
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'roleId'
    }
  })
  roles: Role[];

}