import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Subtype from './Subtype';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tpar_type' })
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