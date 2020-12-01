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
 * Last modified  : 2020-09-18 13:44:26
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import ChatType from './ChatType';
import Message from './Message';
import ChatUser from './ChatUser';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_chat' })
export default class Chat extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'chat_id' })
  chatId: number;

  @Column({ name: 'table_id', type: 'integer', nullable: false })
  tableId: number;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @ManyToOne(() => ChatType, chatType => chatType.chats)
  @JoinColumn({ name: 'chat_type_id' })
  type: ChatType;

  @OneToMany(() => Message, message => message.chat)
  messages: Message[];

  @OneToMany(() => ChatUser, chatUser => chatUser.chat)
  users: ChatUser[];

  @Column({ nullable: true, name: 'chat_type_id' })
  chatTypeId: number;
}