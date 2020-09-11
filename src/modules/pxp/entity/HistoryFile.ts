import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import File from './File';
import PxpEntity from './PxpEntity';

@Entity({ name: 'tpar_history_file', schema: 'pxp' })
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
}