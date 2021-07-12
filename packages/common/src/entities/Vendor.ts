import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tcm_vendor'})
export default class Vendor extends BaseEntity{
  @PrimaryGeneratedColumn({ name: 'vendor_id'})
  vendorId: number;

  @Column({ type: 'varchar', length: 200, nullable: false})
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: false})
  code: string;

  @Column({ type: 'text', nullable: true})
  description: string;

  @Column({ name: 'available_yn', type: 'varchar', length: 1, })
  availableYn: string;

  @Column({ name: 'vendor_id_master_fk', type: 'varchar', length: 200, nullable: false})
  vendorIdMaster: string;
}