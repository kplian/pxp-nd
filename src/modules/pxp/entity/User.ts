
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import Person from './Person';
import Role from './Role';

@Entity({ schema: 'pxp', name: 'tsec_user' })
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'login', type: 'varchar', length: 80, unique: true })
  login: string;

  @Column({ name: 'password', type: 'varchar', length: 80 })
  password: string;

  @Column({ name: 'style', type: 'varchar', length: 80, nullable: true })
  style: string;

  @Column({ name: 'expiration', type: 'date', nullable: true })
  expiration: Date;

  @Column({ name: 'authentication_type', type: 'varchar', length: 80, nullable: false, default: 'local' })
  authenticationType: string;

  @Column({ name: 'token', type: 'varchar', length: 80, unique: true, nullable: true })
  token: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'user_reg', type: 'varchar', length: 80, nullable: true, default: 'local' })
  userReg: string;

  @Column({ name: 'username', type: 'varchar', length: 500 })
  username: string;

  @Column({ name: 'hash', type: 'varchar', length: 500 })
  hash: string;

  @Column({ name: 'salt', type: 'varchar', length: 500 })
  salt: string;

  @OneToOne((type) => Person, {
    eager: true,
    cascade: true
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @ManyToMany(type => Role)
  @JoinTable()
  roles: Role[];
}
