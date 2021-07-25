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
 * Last modified  : 2020-09-18 13:50:48
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Type from './Type';
import { PxpEntity } from '../PxpEntity';

@Entity({ name: 'tpar_subtype' })
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

  @Column({ nullable: true, name: 'type_id' })
  typeId: number;
}