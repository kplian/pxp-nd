import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Translate from './Translate';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tpar_language' })
export default class Language extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'language_id' })
  languageId: number;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ name: 'id_default', default: false })
  isDefault: boolean;

  @OneToMany(() => Translate, translate => translate.language, { eager: true, cascade: true })
  translates: Translate[];
}