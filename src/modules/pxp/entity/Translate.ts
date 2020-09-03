import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import Language from './Language';
import Word from './Word';

@Entity({ schema: 'pxp', name: 'tpar_translate' })
export default class Translate extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'translate_id' })
  translateId: number;

  @Column({ name: 'text', type: 'varchar', length: 30, nullable: false })
  text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(type => Language, language => language.translates)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @ManyToOne(type => Word, word => word.translatesW)
  @JoinColumn({ name: 'word_id' })
  word: Word;
}
