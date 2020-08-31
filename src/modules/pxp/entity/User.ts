import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { Person } from './Person';

// @Entity({ schema: 'public', name: 'tsec_user' })
@Entity({ schema: 'public', name: 'user' })
export class User {
  // @PrimaryGeneratedColumn()
  // user_id: number;

  // @Column({ type: 'varchar', length: 80, unique: true })
  // login: string;

  // @Column({ type: 'varchar', length: 80 })
  // password: string;

  // @Column({ type: 'varchar', length: 80, nullable: true })
  // style: string;

  // @Column({ type: 'date', nullable: true })
  // expiration: Date;

  // @Column({ type: 'varchar', length: 80, nullable: false, default: 'local' })
  // autentification_type: string;

  // @Column({ type: 'varchar', length: 80, unique: true, nullable: true })
  // token: string;

  // @CreateDateColumn({ name: 'created_at' })
  // created_at: Date;

  // @Column({ name: 'is_active', default: true })
  // is_active: boolean;

  // @Column({ type: 'varchar', length: 80, nullable: true, default: 'local' })
  // user_reg: string;

  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  username: string;

  @Column()
  hash: string;
  @Column()
  salt: string;

  // @Column({ name: 'google_id' })
  // googleId?: string;

  // @Column({ name: 'facebook_id' })
  // facebookId?: string;
  // @OneToOne((type) => Person, {
  //   eager: true,
  //   cascade: true
  // })
  // @JoinColumn({ name: 'person_id', referencedColumnName: 'person_id' })
  // person: Person;
}
