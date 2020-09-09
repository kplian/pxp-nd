import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import Subsystem from './Subsystem';
import Transaction from './Transaction';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tsec_procedure' })
export default class Procedure extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'procedure_id' })
  procedureId: number;

  @Column({ name: 'name', type: 'varchar', length: 80 })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @ManyToOne(() => Subsystem, subsystem => subsystem.procedures)
  @JoinColumn({ name: 'subsystem_id' })
  subsystem: Subsystem;

  @OneToMany(() => Transaction, transaction => transaction.procedure)
  transactions: Transaction[];
}