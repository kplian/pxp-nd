import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'io_user_io'})
export default class UserIo extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'user_io_id' })
  userIoId: number;

  @Column({ name: 'client_id', type: 'varchar', length: 25})
  clientId: string;
  
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;
}