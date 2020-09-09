import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';


@Entity({ schema: 'pxp', name: 'tsec_log' })
export default class Log extends BaseEntity {

  @PrimaryGeneratedColumn({name:'log_id'})
  logId: number;

  @Column({name:'username', type: 'varchar', length: 150, nullable: false })
  username: string;

  @Column({ name:'macaddress', type: 'varchar', length: 150, nullable: true })
  macaddres: string;

  @Column({ name:'ip', type: 'varchar', length: 100, nullable: true })
  ip: string;

  @Column({ name:'type_log', type: 'varchar', length: 50, nullable: false })
  typeLog: string;

  @Column({ name:'description', type: 'varchar', nullable: true })
  description: string;

  @Column({ name:'procedure', type: 'varchar', length: 250, nullable: true })
  procedure: string;

  @Column({ name:'transaction', type: 'varchar', length: 250, nullable: true })
  transaction: string;

  @Column({ name:'query', type: 'varchar',  nullable: true})
  query: string;

  @Column({ name:'date_log', type: 'date', nullable: true })
  dateLog: Date;

  @Column({ name:'time_exec', type: 'varchar', length: 20, nullable: true })
  timeExec: string;

  @Column({ name:'user_db', type: 'varchar', length: 100, nullable: true })
  userDb: string;

  @Column({ name:'code_error', type: 'varchar', length: 100, nullable: true})
  codeError: string;

  @Column({ name:'pid_db', type: 'varchar', length: 100, nullable: true })
  pidDB: string;

  @Column({ name:'pid_web', type: 'varchar', length: 100, nullable: true})
  pidWeb: string;

  @Column({ name:'sid_web', type: 'varchar', length: 150, nullable: true })
  sidWeb: string;

  @Column({ name:'code_subsystem', type: 'varchar', length: 150, nullable: true })
  codeSubsystem: string;


}