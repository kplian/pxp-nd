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
 * Last modified  : 2020-09-18 13:44:57
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Chat from './Chat';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_chat_user' })
export default class ChatUser extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'chat_user_id' })
  chatUserId: number;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userIdFrom: number;

  @Column({ name: 'desc_user', type: 'varchar', length: 500, nullable: true })
  descUser: string;

  @ManyToOne(() => Chat, chat => chat.users)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @Column({ nullable: true, name: 'chat_id' })
  chatId: number;
}