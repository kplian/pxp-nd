import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany} from "typeorm";
import Chat from "./Chat";

@Entity({schema: 'pxp', name: "tpar_chat_type"})
export default class ChatType {

    @PrimaryGeneratedColumn({name:'chat_type_id'})
    chatTypeId: number;

    @Column({name:'type', type:'varchar', length: 100, nullable: true })
    type: string;

    @Column({name:'code', type:'varchar', length: 100, nullable: true })
    code: string; 

    @Column({name:'name', type:'varchar', length: 100, nullable: true })
    name: string;

    @Column({name:'table', type:'varchar', length: 100, nullable: true })
    table: string; 

    @Column({name:'group', type:'varchar', length: 100, nullable: true })
    group: string;

    @Column({name:'users', type:'varchar', nullable: true })
    users: string; 

    @Column({name:'url', type:'varchar', length: 200, nullable: true })
    url: string;

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;

    @OneToMany (type=> Chat,chat => chat.chatType)
    chats:Chat[];
}