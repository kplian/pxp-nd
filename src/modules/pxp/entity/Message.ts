import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Chat from './Chat';
import PxpEntity from './PxpEntity';

@Entity({ name: 'tpar_message', schema: 'pxp' })
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
