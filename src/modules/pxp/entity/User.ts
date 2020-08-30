
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import Person from './Person';

@Entity({ schema: 'pxp', name: 'tsec_user' })
export default class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  login: string;

  @Column({ type: 'varchar', length: 80 })
  password: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  style: string;

  @Column({ type: 'date', nullable: true })
  expiration: Date;

  @Column({ type: 'varchar', length: 80, nullable: false, default: 'local' })
  authentication_type: string;

  @Column({ type: 'varchar', length: 80, unique: true, nullable: true })
  token: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 80, nullable: true, default: 'local' })
  user_reg: string;

  @Column()
  username: string;

  @Column()
  hash: string;

  @Column()
  salt: string;

  @OneToOne((type) => Person, {
    eager: true,
    cascade: true
  })
  @JoinColumn({ name: 'person_id', referencedColumnName: 'person_id' })
  person: Person;
}
