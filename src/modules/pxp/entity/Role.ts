/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * long description for the file
 *
 * @summary short description for the file
 * @author No author
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-09-17 18:58:51
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';

import User from './User';
import Subsystem from './Subsystem';
import Ui from './Ui';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ schema: 'pxp', name: 'tsec_role' })
export default class Role extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'role', type: 'varchar', length: 100, nullable: false })
  role: string;

  @Column({ name: 'description', type: 'text', nullable: false })
  description: string;

  @ManyToMany(() => User)
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

  @ManyToOne(() => Subsystem, subsystem => subsystem.roles)
  @JoinColumn({ name: 'subsystem_id' })
  subsystem: Subsystem;

  @ManyToMany(() => Ui)
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