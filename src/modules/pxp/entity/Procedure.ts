import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import Subsystem from './Subsystem';
import Transaction from './Transaction';

@Entity()
export default class Procedure {

  @PrimaryGeneratedColumn({ name: 'procedure_id' })
  procedureId: number;

  @Column({ name: 'name', type: 'varchar', length: 80 })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @ManyToOne(type => Subsystem, subsystem => subsystem.procedures)
  @JoinColumn({ name: 'fk_subsystem_id' })
  subsystem: Subsystem;

  @OneToMany(type => Transaction, transaction => transaction.procedure)
  transactions: Transaction[];
}