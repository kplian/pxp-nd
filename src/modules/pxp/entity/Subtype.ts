import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import Type from './Type';

@Entity({ schema: 'pxp', name: 'tpar_subtype' })
export default class Subtype extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'subtype_id' })
  subtypeId: number;

  @Column({ name: 'code', type: 'varchar', length: 30, nullable: false })
  code: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'order', type: 'int' })
  order: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(type => Type, ttype => ttype.subtypes)
  @JoinColumn({ name: 'type_id' })
  ttype: Subtype;
}
