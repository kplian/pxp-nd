import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import Translate from './Translate';


@Entity({ schema: 'pxp', name: 'tpar_language' })
export default class Language extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'language_id' })
  languageId: number;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ name: 'id_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;


  @OneToMany(type => Translate, translate => translate.language, { eager: true, cascade: true })
  translates: Translate[];
}