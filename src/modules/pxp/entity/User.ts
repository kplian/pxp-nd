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
 * Last modified  : 2020-09-17 19:00:27
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import Person from './Person';
import Role from './Role';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ schema: 'pxp', name: 'tsec_user' })
export default class User extends PxpEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId?: number;

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
    schema: 'pxp',
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
}