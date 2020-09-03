import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import Transaction from './Transaction';
import Role from './Role';
//import { Tsec_ui_tree } from './tsec_ui_tree';

@Entity({ name: 'tsec_ui' })

export default class Ui extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'ui_id' })
  uiId: number;

  @Column({ name: 'code', type: 'varchar', length: 80, nullable: false })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 80, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'visible', type: 'varchar', length: 80, nullable: true })
  visible: string;

  @Column({ name: 'route', type: 'varchar', length: 80, nullable: true })
  route: string;

  @Column({ name: 'order', type: 'integer', nullable: true })
  order: number;

  @Column({ name: 'icon', type: 'varchar', length: 80, nullable: true })
  icon: string;

  @ManyToMany(type => Role)
  @JoinTable()
  roles: Role[];

  @ManyToMany(type => Transaction)
  @JoinTable()
  transactions: Transaction[];

  //@OneToMany(type => Tsec_ui_tree, tsec_ui_tree => tsec_ui_tree.tsec_ui)
  //tsec_ui_trees: Tsec_ui_tree[];


}