import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Chat from './Chat';
import PxpEntity from './PxpEntity';

@Entity({ name: 'tpar_chat_user', schema: 'pxp' })
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
}
