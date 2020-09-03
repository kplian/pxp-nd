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
  @JoinTable()
  users: User[];

  @ManyToOne(type => Subsystem, subsystem => subsystem.roles)
  @JoinColumn({ name: 'fk_subsystem_id' })
  subsystem: Subsystem;

  @ManyToMany(type => Ui)
  @JoinTable()
  uis: Ui[];

}