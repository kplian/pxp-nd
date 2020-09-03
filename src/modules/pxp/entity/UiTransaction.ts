import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import Transaction from './Transaction';
import Ui from './Ui';
import Role from './Role';

@Entity({ name: 'tsec_ui_transaction', schema: 'pxp' })
export default class UiTransaction extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'ui_transaction_id' })
  uiTransactionId: number;

  @Column({ name: 'button', type: 'boolean', length: 200, nullable: true })
  button: string

  @Column({ name: 'description', type: 'text', nullable: true })
  buttonName: string

  @ManyToOne(type => Ui, ui => ui.transactions)
  @JoinColumn({ name: 'fk_ui_id' })
  ui: Ui;

  @ManyToOne(type => Transaction, transaction => transaction.uis)
  @JoinColumn({ name: 'fk_transaction_id' })
  transaction: Transaction;

  @ManyToMany(type => Role)
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