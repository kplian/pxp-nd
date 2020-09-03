import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import Chat from './Chat';

@Entity({ name: 'tpar_chat_user', schema: 'pxp' })
export default class ChatUser extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'chat_user_id' })
  chatUserId: number;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  userIdFrom: number;

  @Column({ name: 'desc_user', type: 'varchar', nullable: true })
  descUser: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;


  @ManyToOne(type => Chat, chat => chat.chatUser)
  @JoinColumn({ name: 'chat_id' })
  chatU: Chat;
}
