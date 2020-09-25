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
import Word from './Word';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_language_group' })
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