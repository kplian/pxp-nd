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
 * Last modified  : 2020-09-30 09:59:20
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  getManager
} from 'typeorm';
import Person from './Person';
import Role from './Role';
import { __ } from '@pxp-nd/core';
import {PxpEntity} from '../PxpEntity'

@Entity({ name: 'tsec_user' })
export default class User extends PxpEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'username', type: 'varchar', length: 500 })
  username: string;

  @Column({ name: 'password', type: 'varchar', length: 200, nullable: true })
  password?: string;

  @Column({ name: 'style', type: 'varchar', length: 80, nullable: true })
  style?: string;

  @Column({ name: 'expiration', nullable: true })
  expiration?: Date;

  @Column({
    name: 'authentication_type',
    type: 'varchar',
    length: 80,
    nullable: false,
    default: 'local'
  })
  authenticationType?: string;

  @Column({
    name: 'token',
    type: 'varchar',
    length: 80,
    unique: true,
    nullable: true
  })
  authenticationId?: string;

  @Column({ name: 'hash', type: 'varchar', length: 500 })
  hash?: string;

  @Column({ name: 'salt', type: 'varchar', length: 500 })
  salt?: string;

  @OneToOne(() => Person, {
    eager: true,
    cascade: true
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'tsec_user_role',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'userId'
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'roleId'
    }
  })
  roles: Role[];

  @Column({ nullable: true, name: 'person_id' })
  personId: number;

  @Column({ nullable: true, name: 'role_id' })
  roleId: number;

  static async getUis(userId: number): Promise<number[]> {

    const uiArray = await __(getManager()
      .createQueryBuilder(Role, 'role')
      .innerJoinAndSelect('role.uis', 'ui')
      .innerJoin('role.users', 'user')
      .select(['ui.ui_id'])
      .distinct(true)
      .where('"user".user_id = :userId', { userId })
      .getRawMany());

    const result = uiArray.map((a: any) => a.ui_id);
    return result;
  }

}