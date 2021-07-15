import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '@pxp-nd/entities';

@Entity({ name: 'group'})
export default class Group extends BaseEntity{
  @PrimaryGeneratedColumn({ name: 'group_id'})
  groupId: number;

  @Column({ type: 'varchar', length: 200, nullable: false})
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false})
  code: string;

  @Column({ type: 'integer'})
  branchId: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'tcm_group_user',    
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'groupId'
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'userId'
    },
  })
  users: User[];
}