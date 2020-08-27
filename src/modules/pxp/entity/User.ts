import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity({ schema: 'pxp', name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // firstName: string;

  // @Column()
  // lastName: string;

  // @Column()
  // isActive: boolean;

  @Column()
  username: string;

  @Column()
  hash: string;
  @Column()
  salt: string;
}
