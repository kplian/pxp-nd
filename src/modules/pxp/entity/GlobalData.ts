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
 * Last modified  : 2020-09-18 13:46:27
 */
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_global_data' })
@Unique(['data'])
export default class GlobalData extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'global_data_id' })
  globalDataId: number;

  @Column({ name: 'data', type: 'varchar', length: 100, nullable: false })
  data: string;

  @Column({ name: 'value', type: 'text', nullable: false })
  value: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: false })
  description: string;
}