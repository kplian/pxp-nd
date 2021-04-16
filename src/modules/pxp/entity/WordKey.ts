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
import TranslationGroup from './TranslationGroup';
import Translate from './Translate';
import { PxpEntity } from '../../../lib/pxp';
@Unique(['code'])
@Entity({ name: 'tpar_word' })
export default class WordKey extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'word_key_id' })
  wordKeyId: number;

  @Column({ name: 'code', type: 'varchar', length: 30, nullable: false })
  code: string;

  @Column({ name: 'default_text', type: 'varchar', length: 150, nullable: true })
  defaultText: string;

  @ManyToOne(() => TranslationGroup, translationGroup => translationGroup.words)
  @JoinColumn({ name: 'translation_group_id' })
  group: TranslationGroup;

  @OneToMany(() => Translate, translate => translate.wordKey, { eager: true, cascade: true })
  translates: Translate[];

  @Column({ nullable: true, name: 'language_group_id' })
  languageGroupId: number;


}