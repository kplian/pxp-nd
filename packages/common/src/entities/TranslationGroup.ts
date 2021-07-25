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
 * Last modified  : 2020-09-18 13:48:15
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import WordKey from './WordKey';
import { PxpEntity } from '../PxpEntity';

@Entity({ name: 'tpar_translation_group' })
export default class TranslationGroup extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'translation_group_id' })
  translationGroupId: number;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  module: string;

  @Column({ name: 'table_name', type: 'varchar', length: 250, nullable: true })
  tableName: string;

  @Column({ name: 'column_translate', type: 'varchar', length: 250, nullable: true })
  columnTranslate: string;

  @Column({ name: 'column_key', type: 'varchar', length: 250, nullable: true })
  columnKey: string;

  @OneToMany(() => WordKey, word => word.group, { eager: true, cascade: true })
  words: WordKey[];
}