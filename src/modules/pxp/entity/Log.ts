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
 * Last modified  : 2020-09-18 13:48:03
 */
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from 'typeorm';


@Entity({ name: 'tsec_log' })
export default class Log extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'log_id' })
  logId: number;

  @Column({ name: 'username', type: 'varchar', length: 150, nullable: false })
  username: string;

  @Column({ name: 'macaddress', type: 'varchar', length: 150, nullable: true })
  macaddres: string;

  @Column({ name: 'ip', type: 'varchar', length: 100, nullable: true })
  ip: string;

  @Column({ name: 'log_type', type: 'varchar', length: 50, nullable: false })
  logType: string;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

  @Column({ name: 'procedure', type: 'varchar', length: 250, nullable: true })
  procedure: string;

  @Column({ name: 'transaction', type: 'varchar', length: 250, nullable: true })
  transaction: string;

  @Column({ name: 'query', type: 'text', nullable: true })
  query: string;

  @Column({ name: 'request', type: 'text', nullable: true })
  request: string;

  @Column({ name: 'response', type: 'text', nullable: true })
  response: string;

  @CreateDateColumn({ name: 'log_date' })
  logDate: Date;

  @Column({ name: 'exec_time', nullable: true })
  execTime: number;

  @Column({ name: 'error_code', type: 'varchar', length: 100, nullable: true })
  errorCode: string;

}