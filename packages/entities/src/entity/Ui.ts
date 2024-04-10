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
 * Last modified  : 2020-10-09 09:10:00
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn, getManager } from 'typeorm';
import Role from './Role';
import Subsystem from './Subsystem';
import UiTransaction from './UiTransaction';
import { PxpEntity } from '../PxpEntity';


@Entity({ name: 'tsec_ui' })
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

  @Column({ nullable: true, name: 'parent_ui_id' })
  parentId: number;

  @Column({ nullable: false, name: 'subsystem_id' })
  subsystemId: number;

  @ManyToOne(() => Ui, ui => ui.children)
  @JoinColumn({ name: 'parent_ui_id' })
  parent: Ui;

  @OneToMany(() => Ui, ui => ui.parent)
  children: Ui[];

  @ManyToOne(() => Subsystem, subsystem => subsystem.uis)
  @JoinColumn({ name: 'subsystem_id' })
  subsystem: Subsystem;

  @Column({ nullable: true, name: 'role_id' })
  roleId: number;

  type: string;


  static async findRecursive(params: Record<string, unknown>, parentId: number, isAdmin?: boolean, uiList: number[] = []): Promise<unknown> {
    if (uiList.length === 0 && !isAdmin) {
      return [];
    }

    const qb = getManager()
      .createQueryBuilder(Ui, 'ui')
      .innerJoin('ui.subsystem', 'ss')
      .select('ui.uiId', 'uiId')
      .addSelect('ui.parentId', 'parentId')
      .addSelect('ui.code', 'code')
      .addSelect('ui.name', 'text')
      .addSelect('ui.description', 'description')
      .addSelect('ui.route', 'component')
      .addSelect('ui.order', 'order')
      .addSelect('ui.icon', 'icon')
      .addSelect('ss.code', 'subsystem')
      .where('ui.parent_ui_id = :parentId', { parentId });

    if (params.system && params.system !== undefined ) {      
      qb.andWhere('ss.code = :system', { system: params.system });
    }

    // validate permission
    if (!isAdmin) {      
      qb.andWhere('ui.ui_id IN(:...uiList)', { uiList });
    }

    const uis = await qb.getRawMany() as Ui[];
    console.log(uis);
    let resUis = uis;
    let isPush = false;

    if (parentId === 1 && !params.includeSystemRoot) {
      resUis = [] as Ui[];
      isPush = true;
    }

    if (params.folder && params.folder !== undefined) {
      console.log('folder', params.folder);
      resUis = [] as Ui[];
      isPush = true;
    }

    let count = 0;
    // recursive call
    for (const ui of uis) {
      if (isPush) {
        const newParams = Object.assign(params);
        if (newParams.folder && newParams.folder === ui.code) {
          delete newParams.folder;
        }
        resUis.push(...await this.findRecursive(newParams, ui.uiId, isAdmin, uiList) as Ui[]);
      } else {
        resUis[count].children = await this.findRecursive(params, ui.uiId, isAdmin, uiList) as Ui[];
        if (resUis[count].children.length === 0) {
          resUis[count].type = 'leaf';
        } else {
          resUis[count].type = 'branch';
        }
        count++;
      }

    }
    return resUis;
  }

}