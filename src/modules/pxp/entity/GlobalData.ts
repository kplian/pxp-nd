import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tpar_global_data' })
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