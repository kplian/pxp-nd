import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


@Entity({ schema: 'pxp', name: 'tpar_global_data' })
export default class GlobalData extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'global_data_id' })
  globalDataId: number;

  @Column({ name: 'data', type: 'varchar', length: 50, nullable: true })
  data: string;

  @Column({ name: 'value', type: 'varchar', length: 50, nullable: true })
  value: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;


}