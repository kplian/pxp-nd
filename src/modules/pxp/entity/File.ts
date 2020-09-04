import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import FileType from './FileType';
import HistoryFile from './HistoryFile';
import PxpEntity from './PxpEntity';

@Entity({ name: 'tpar_file', schema: 'pxp' })
export default class File extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'file_id' })
  fileId: number;

  @Column({ name: 'table_id', type: 'integer', nullable: false })
  tableId: number;

  @Column({ name: 'name_file', type: 'varchar', length: 500, nullable: true })
  nameFile: string;

  @Column({ name: 'extension', type: 'varchar', length: 500, nullable: true })
  extension: string;

  @Column({ name: 'folder', type: 'varchar', length: 500, nullable: true })
  folder: string;

  @ManyToOne(() => FileType, fileType => fileType.files)
  @JoinColumn({ name: 'file_type_id' })
  type: FileType;

  @OneToMany(() => HistoryFile, HistoryFile => HistoryFile.file)
  historyFiles: HistoryFile[];
}
