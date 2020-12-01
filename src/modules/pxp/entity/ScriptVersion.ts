/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * ScriptVersion
 *
 * @summary short description for the file
 * @author No author
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-10-20 17:39:39
 */
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from 'typeorm';


@Entity({ name: 'tsec_script_version' })
export default class ScriptVersion extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'script_version_id' })
  scriptVersionId: number;

  @CreateDateColumn({ name: 'exec_date' })
  execDate: Date;

  @Column({ name: 'script_code', type: 'varchar', length: 200, nullable: false, unique: true })
  scriptCode: string;
}