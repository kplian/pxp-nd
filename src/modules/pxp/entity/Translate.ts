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
 * Last modified  : 2020-09-17 19:00:09
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Language from './Language';
import Word from './Word';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ schema: 'pxp', name: 'tpar_translate' })
export default class Translate extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'translate_id' })
  translateId: number;

  @Column({ name: 'text', type: 'varchar', length: 30, nullable: false })
  text: string;

  @ManyToOne(() => Language, language => language.translates)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @ManyToOne(() => Word, word => word.translates)
  @JoinColumn({ name: 'word_id' })
  word: Word;
}