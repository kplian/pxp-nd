import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tpar_config_value'})
export default class ConfigValue extends BaseEntity{
  @PrimaryGeneratedColumn({ name: 'config_value_id'})
  configValueId: number;

  @Column({ type: 'varchar', length: 200, nullable: false})
  value: string;

  @Column({ name: 'config_id', type: 'integer', nullable: true})
  configId: number;

  @Column({ name: 'vendor_id', type: 'integer', nullable: true})
  vendorId: number;
}