import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ schema: 'pxp', name: 'tuser' })
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  isActive: boolean;

  @Column()
  nombre = ''

}