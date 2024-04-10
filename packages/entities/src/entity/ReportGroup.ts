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
} from 'typeorm';

@Entity({ name: 'tpar_report_group' })
export default class ReportGroup {
  @PrimaryGeneratedColumn({ name: 'report_group_id' })
  reportGroupId: number;

  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ name: 'allow_roles', type: 'varchar', nullable: true })
  allowRoles?: Array<any>;

  @Column({  nullable: true }) 
  active?: boolean;
}