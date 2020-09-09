import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, } from "typeorm";


@Entity({schema: 'pxp', name: "tpar_notification"})
export default class Notification {

    @PrimaryGeneratedColumn({name:'notification_id'})
    notificationId: number;

    @Column({name:'type', type:'varchar', length: 50, nullable: true })
    type: string;

    @Column({name:'tittle', type:'varchar', length: 50, nullable: true })
    tittle: string; 

    @Column({name:'description', type:'varchar', length: 500, nullable: true })
    description: string; 

    @Column({name:'url', type:'varchar', length: 50, nullable: true })
    url: string; 

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;

    
}