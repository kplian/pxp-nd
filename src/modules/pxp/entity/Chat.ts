import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import ChatType from './ChatType';
import Message from './Message';
import ChatUser from './ChatUser';
import PxpEntity from './PxpEntity';

@Entity({ name: 'tpar_chat', schema: 'pxp' })
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
}
