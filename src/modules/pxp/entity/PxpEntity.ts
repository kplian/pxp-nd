import { Entity, BaseEntity, Column, CreateDateColumn } from 'typeorm';


@Entity({ name: 'tpar_chat', schema: 'pxp' })
export default class Chat extends BaseEntity {

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

}
