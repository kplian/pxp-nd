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
 * Last modified  : 2020-09-18 13:44:46
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Chat from './Chat';
import { PxpEntity } from '../PxpEntity';

@Entity({ name: 'tpar_chat_type' })
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