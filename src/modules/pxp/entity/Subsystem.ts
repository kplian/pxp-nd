import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Role from './Role';
import Procedure from './Procedure';
import Ui from './Ui';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tsec_subsystem' })
export default class Subsystem extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'subsystem_id' })
  subsystemId: number;

  @Column({ name: 'code', type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ name: 'folder_name', type: 'varchar', length: 50, nullable: true })
  folderName: string;

  @Column({ name: 'prefix', type: 'varchar', length: 10, nullable: true })
  prefix: string;

  @OneToMany(() => Procedure, procedure => procedure.subsystem)
  procedures: Procedure[];

  @OneToMany(() => Role, role => role.subsystem)
  roles: Role[];

  @OneToMany(() => Ui, ui => ui.subsystem)
  uis: Ui[];

} 