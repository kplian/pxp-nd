import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany} from "typeorm";
import  Subtype from "./Subtype";

@Entity({schema: 'pxp', name: "tpar_type"})
export default class Type  {

    @PrimaryGeneratedColumn({name:'type_id'})
    typeId: number;

    @Column({name:'name', type:'varchar', length: 100, nullable: true })
    name: string;

    @Column({name:'table', type:'varchar', length: 100, nullable: true })
    table: string; 

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;

    @OneToMany ( type=> Subtype, subtype => subtype.ttype,{eager:true,cascade:true})
    subtypes:Subtype[];

}