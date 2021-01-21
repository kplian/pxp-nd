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
 * Created at     : 2020-30-11 10:55:38
 * Last modified  : 2020-30-11 20:59:20
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  getManager
} from 'typeorm';
import Person from './Person';
import Role from './Role';
import { PxpEntity, __ } from '../../../lib/pxp';

@Entity({ name: 'tpar_report' })
export default class Report {
  @PrimaryGeneratedColumn({ name: 'report_id' })
  reportId: number;

  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'text', nullable: true })
  query?: string;

  @Column({ name: 'detail_query', type: 'text', nullable: true })
  detailQuery?: string;
  
  @Column({ name: 'query_orm', type: 'text', nullable: true })
  queryOrm?: string;

  @Column({ type: 'text', nullable: true })
  template?: string;

  @Column({ type: 'text', nullable: true })
  filters?: string;

  @Column({ type: 'text', nullable: true }) 
  config?: string;

  @Column({ type: 'integer', nullable: true }) 
  order?: string;

  @Column({ name: 'report_group_id',type: 'integer', nullable: true }) 
  reportGroupId?: number;

  @Column({ type: 'boolean', nullable: true }) 
  active?: boolean;

}