import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ schema: 'pxp', name: 'tuser' })
export default class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  isActive: boolean;
}