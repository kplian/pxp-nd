import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Catalog } from './Catalog';

@Entity({ name: 'tcatalog_value' })
export class CatalogValue {
  @PrimaryGeneratedColumn({ name: 'catalog_value_id' })
  catalogValueId: number;

  @Column({
    name: 'catalog_id',
    type: 'integer',
    // length: 50,
    nullable: true })
  catalogId: number;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 50,
    nullable: true })
  code: string;


  @Column({
    name: 'value',
    type: 'varchar',
    length: 50,
    nullable: true })
  value: string;

  @Column({
    name: 'order_value',
    type: 'integer',
    // length: 50,
    nullable: true })
  orderValue: number;

  @Column({
    name: 'default',
    type: 'varchar',
    length: 3,
    nullable: true })
  default: string;

  @ManyToOne(() => Catalog, catalog => catalog.values)
  @JoinColumn({ name: 'catalog_id' })
  catalog: Catalog;
}