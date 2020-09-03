import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';

import User from './User';
import Subsystem from './Subsystem';
import Ui from './Ui';

@Entity({ name: 'tsec_role' })
export default class Role {

  @PrimaryGeneratedColumn({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'role', type: 'varchar', length: 80, nullable: false })
  role: string;

  @Column({ name: 'description', type: 'text', length: 100, nullable: false })
  description: string;

  @ManyToMany(type => User)
  @JoinTable({
    schema: 'pxp',
    name: 'tsec_user_role',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'roleId'
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'userId'
    }
  })
  users: User[];

  @ManyToOne(type => Subsystem, subsystem => subsystem.roles)
  @JoinColumn({ name: 'fk_subsystem_id' })
  subsystem: Subsystem;

  @ManyToMany(type => Ui)
  @JoinTable({
    schema: 'pxp',
    name: 'tsec_ui_role',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'roleId'
    },
    inverseJoinColumn: {
      name: 'ui_id',
      referencedColumnName: 'uiId'
    }
  })
  uis: Ui[];

}