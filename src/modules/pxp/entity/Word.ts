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
 * Last modified  : 2020-09-18 13:50:22
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import LanguageGroup from './LanguageGroup';
import Translate from './Translate';
import { PxpEntity } from '../../../lib/pxp';
@Unique(['code'])
@Entity({ name: 'tpar_word' })
export default class Word extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'word_id' })
  wordId: number;

  @Column({ name: 'code', type: 'varchar', length: 30, nullable: false })
  code: string;

  @Column({ name: 'default_text', type: 'varchar', nullable: true })
  defaultText: string;

  @ManyToOne(() => LanguageGroup, languageGroup => languageGroup.words)
  @JoinColumn({ name: 'language_group_id' })
  languageGroup: LanguageGroup;

  @OneToMany(() => Translate, translate => translate.word, { eager: true, cascade: true })
  translates: Translate[];

}