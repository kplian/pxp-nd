import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Word from './Word';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tpar_language_group' })
export default class LanguageGroup extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'language_group_id' })
  languageGroupId: number;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
  type: string;

  @OneToMany(() => Word, word => word.languageGroup, { eager: true, cascade: true })
  words: Word[];
}