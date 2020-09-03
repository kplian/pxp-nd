import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import Chat from './Chat';

@Entity({ name: 'tpar_message', schema: 'pxp' })
export default class Message extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'user_id_from', type: 'integer', nullable: false })
  userIdFrom: number;

  @Column({ name: 'user_id_to', type: 'integer', nullable: false })
  userIdTo: number;

  @Column({ name: 'message', type: 'varchar', nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;


  @ManyToOne(type => Chat, chat => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
