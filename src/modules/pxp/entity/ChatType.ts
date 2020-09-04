import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Chat from './Chat';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tpar_chat_type' })
export default class ChatType extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'chat_type_id' })
  chatTypeId: number;

  @Column({ name: 'type', type: 'varchar', length: 100, nullable: true })
  type: string;

  @Column({ name: 'code', type: 'varchar', length: 100, nullable: true })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ name: 'table', type: 'varchar', length: 100, nullable: true })
  table: string;

  @Column({ name: 'group', type: 'varchar', length: 100, nullable: true })
  group: string;

  @Column({ name: 'users', type: 'varchar', nullable: true })
  users: string;

  @Column({ name: 'url', type: 'varchar', length: 200, nullable: true })
  url: string;

  @OneToMany(() => Chat, chat => chat.type)
  chats: Chat[];
}