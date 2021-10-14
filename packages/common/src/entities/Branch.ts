import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tpar_branch'})
export default class Branch extends BaseEntity{
  @PrimaryGeneratedColumn({ name: 'branch_id'})
  branchId: number;

  @Column({ type: 'varchar', length: 200, nullable: false})
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: false})
  code: string;

  @Column({ type: 'text', nullable: true})
  description: string;

  @Column({ name: 'available_yn', type: 'varchar', length: 1, })
  availableYn: string;

  @Column({ name: 'branch_id_master_fk', type: 'varchar', length: 200, nullable: false})
  branchIdMaster: string;

  @Column({ name: 'location_id', type: 'varchar', length: 200, nullable: false})
  locationId: string;
}