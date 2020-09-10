import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Type from './Type';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tpar_subtype' })
export default class Subtype extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'subtype_id' })
  subtypeId: number;

  @Column({ name: 'code', type: 'varchar', length: 30, nullable: false })
  code: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'order', type: 'int' })
  order: number

  @ManyToOne(() => Type, type => type.subtypes)
  @JoinColumn({ name: 'type_id' })
  type: Type;
}