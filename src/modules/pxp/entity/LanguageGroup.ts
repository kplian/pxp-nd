import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import Word from "./Word";


@Entity({schema: 'pxp', name: "tpar_language_group"})
export default class LanguageGroup {

    @PrimaryGeneratedColumn({name:'language_group_id'})
    languageGroupId: number;

    @Column({name:'code', type:'varchar', length: 50, nullable: false })
    code: string;

    @Column({name:'name', type:'varchar', length: 50, nullable: true })
    name: string; 

    @Column({name:'type', type:'varchar', length: 50, nullable: true})
    type: string; 

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;

    @OneToMany( type=> Word, word => word.languageGroup,{eager:true,cascade:true})
    words:Word[];
}