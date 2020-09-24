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
 * Last modified  : 2020-09-18 13:47:08
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import File from './File';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_history_file' })
export default class HistoryFile extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'history_file_id' })
  historyFileId: number;

  @Column({ name: 'table_id', type: 'integer', nullable: false })
  tableId: number;

  @Column({ name: 'version', type: 'varchar', length: 500, nullable: true })
  version: string;

  @ManyToOne(() => File, file => file.historyFiles)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ nullable: true, name: 'file_id' })
  fileId: number;
}