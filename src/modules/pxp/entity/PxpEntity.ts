import { BaseEntity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export default class PxpEntity extends BaseEntity {

  @Column({ name: 'created_by', type: 'varchar', length: 500, default: 'admin' })
  createdBy: string;

  @Column({ name: 'user_id_ai', nullable: true })
  userIdAi: number;

  @Column({ name: 'user_ai', type: 'varchar', length: 300, nullable: true })
  userAi: string;

  @Column({ name: 'modified_by', nullable: true, type: 'varchar', length: 500 })
  modifiedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at', nullable: true })
  modifiedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

}