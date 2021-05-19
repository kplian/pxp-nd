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
 * Last modified  : 2020-09-18 13:51:59
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Language from './Language';
import WordKey from './WordKey';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_translate' })
export default class Translate extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'translate_id' })
  translateId?: number;

  @Column({ name: 'text', type: 'text', nullable: false })
  text: string;

  @Column({ name: 'state', type: 'varchar', length: 30, nullable: true })
  state: string;

  @Column({ name: 'word_id', nullable: false })
  wordId: number;

  @Column({ name: 'language_id', nullable: false })
  languageId: number;

  @ManyToOne(() => Language, language => language.translates)
  @JoinColumn({ name: 'language_id' })
  language?: Language;

  @ManyToOne(() => WordKey, wordKey => wordKey.translates)
  @JoinColumn({ name: 'word_id' })
  wordKey?: WordKey;
}