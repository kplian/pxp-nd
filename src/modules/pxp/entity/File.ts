import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import FileType from './FileType';
import HistoryFile from './HistoryFile';

@Entity({ name: 'tpar_file', schema: 'pxp' })
export default class File extends BaseEntity {

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;


  @ManyToOne(type => FileType, fileType => fileType.files)
  @JoinColumn({ name: 'file_type_id' })
  fileType: FileType;

  @OneToMany(type => HistoryFile, HistoryFile => HistoryFile.file)
  historyFiles: HistoryFile[];


}
