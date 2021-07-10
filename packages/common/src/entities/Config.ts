import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'config'})
export default class Config extends BaseEntity{
  @PrimaryGeneratedColumn({ name: 'config_id'})
  configId: number;

  @Column({ type: 'varchar', length: 200, nullable: false})
  name: string;

  @Column({ type: 'text', nullable: true})
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: false})
  code: string;

  @Column({ type: 'varchar', length: 50, nullable: false})
  type: string;
}