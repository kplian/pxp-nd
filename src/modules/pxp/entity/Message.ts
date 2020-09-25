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
 * Last modified  : 2020-09-18 13:47:54
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Chat from './Chat';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_message' })
export default class Message extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'user_id_from', type: 'integer', nullable: false })
  userIdFrom: number;

  @Column({ name: 'user_id_to', type: 'integer', nullable: false })
  userIdTo: number;

  @Column({ name: 'message', type: 'varchar', nullable: true })
  message: string;

  @ManyToOne(() => Chat, chat => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}