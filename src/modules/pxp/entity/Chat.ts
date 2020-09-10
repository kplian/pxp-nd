import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import ChatType from "./ChatType";
import Message from "./Message";
import ChatUser from "./ChatUser";

@Entity({name:"tpar_chat", schema: 'pxp'})
export default class Chat {

    @PrimaryGeneratedColumn({name:'chat_id'})
    chatId: number;

    @Column({name:'table_id', type:'integer', nullable: false })
    tableId: number;

    @Column({name:'description', type:'varchar', length: 500, nullable: true })
    description: string; 

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;


    @ManyToOne(type=> ChatType, chatType=> chatType.chats)
    @JoinColumn({name:"chat_type_id"})
    chatType:ChatType;

    @OneToMany (type=> Message,message => message.chat)
    messages:Message[];

    @OneToMany (type=> ChatUser,chatUser => chatUser.chatU)
    chatUser:ChatUser[];
}
