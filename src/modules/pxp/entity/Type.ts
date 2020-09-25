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
 * Last modified  : 2020-09-18 13:51:47
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Subtype from './Subtype';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_type' })
export default class Type extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'type_id' })
  typeId: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ name: 'table', type: 'varchar', length: 100, nullable: true })
  table: string;

  @OneToMany(() => Subtype, subtype => subtype.type, { eager: true, cascade: true })
  subtypes: Subtype[];
}