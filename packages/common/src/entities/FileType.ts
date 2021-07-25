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
 * Last modified  : 2020-09-18 13:46:18
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import File from './File';
import { PxpEntity } from '../PxpEntity';

@Entity({ name: 'tpar_file_type' })
export default class FileType extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'file_type_id' })
  fileTypeId: number;

  @Column({ name: 'table_name', type: 'varchar', length: 100, nullable: true })
  tableName: string;

  @Column({ name: 'code', type: 'varchar', length: 100, nullable: true })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ name: 'extension', type: 'varchar', length: 100, nullable: true })
  extension: string;

  @Column({ name: 'max_size', type: 'varchar', length: 100, nullable: true })
  max_size: string;

  @Column({ name: 'order', type: 'integer', nullable: true })
  order: number;

  @Column({ name: 'multiple', type: 'varchar', length: 100, nullable: true })
  multiple: string;

  @OneToMany(() => File, file => file.type)
  files: File[];
}