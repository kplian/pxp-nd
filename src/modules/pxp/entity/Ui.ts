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
 * Last modified  : 2020-09-17 19:00:20
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import Role from './Role';
import Subsystem from './Subsystem';
import UiTransaction from './UiTransaction';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ schema: 'pxp', name: 'tsec_ui' })
export default class Ui extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'ui_id' })
  uiId: number;

  @Column({ name: 'code', type: 'varchar', length: 80, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 80, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'visible', type: 'varchar', length: 20, nullable: true, default: 'yes' })
  visible: string;

  @Column({ name: 'route', type: 'varchar', length: 80, nullable: true })
  route: string;

  @Column({ name: 'order', type: 'integer', nullable: true })
  order: number;

  @Column({ name: 'icon', type: 'varchar', length: 80, nullable: true })
  icon: string;

  @ManyToMany(() => Role)
  @JoinTable({
    schema: 'pxp',
    name: 'tsec_ui_role',
    joinColumn: {
      name: 'ui_id',
      referencedColumnName: 'uiId'
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'roleId'
    }
  })
  roles: Role[];

  @OneToMany(() => UiTransaction, uiTransaction => uiTransaction.ui)
  @JoinTable()
  transactions: UiTransaction[];

  @ManyToOne(() => Ui, ui => ui.children)
  @JoinColumn({ name: 'parent_ui_id' })
  parent: Ui;

  @OneToMany(() => Ui, ui => ui.parent)
  children: Ui[];

  @ManyToOne(() => Subsystem, subsystem => subsystem.uis)
  @JoinColumn({ name: 'subsystem_id' })
  subsystem: Subsystem;

}