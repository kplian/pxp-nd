import { Entity, BaseEntity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity({ name: 'tpar_chat', schema: 'pxp' })
export default class PxpEntity extends BaseEntity {

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'user_id_ai', nullable: true })
  userIdAi: number;

  @Column({ name: 'user_ai', type: 'varchar', length: 300, nullable: true })
  userAi: string;

  @Column({ name: 'modified_by', nullable: true })
  modifiedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at', nullable: true })
  modifiedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

}
