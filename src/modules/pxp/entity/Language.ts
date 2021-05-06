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
 * Last modified  : 2020-09-18 13:47:32
 */
import { 
  Entity, PrimaryGeneratedColumn, Column, OneToMany
 } from 'typeorm';
import Translate from './Translate';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_language' })
export default class Language extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'language_id' })
  languageId: number;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ name: 'is_default', type: 'smallint', default: 0 })
  isDefault: boolean;

  @OneToMany(() => Translate, translate => translate.language, { eager: true, cascade: true })
  translates: Translate[];
}