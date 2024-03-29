import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import CatalogValue from './CatalogValue';

@Entity({  name: 'tcatalog' })
export default class Catalog {
  @PrimaryGeneratedColumn({ name: 'catalog_id' })
  catalogId: number;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 50,
    nullable: true })
  code: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 50,
    nullable: true })
  name: string;

  @OneToMany(() => CatalogValue, value => value.catalog)
  values: CatalogValue[];
}