import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import Procedure from './Procedure';
import Ui from './Ui';

@Entity()

export default class Transaction extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'code', type: 'varchar', length: 200, nullable: true })
  code: string

  @Column({ name: 'description', type: 'text' })
  description: string

  @ManyToOne(type => Procedure, procedure => procedure.transactions)
  @JoinColumn({ name: 'fk_procedure_id' })
  procedure: Procedure;

  @ManyToMany(type => Ui)
  @JoinTable()
  uis: Ui[];

}