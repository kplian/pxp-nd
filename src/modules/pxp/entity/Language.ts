import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";


@Entity({schema: 'pxp', name: "tpar_language"})
export default class Language {

    @PrimaryGeneratedColumn({name:'language_id'})
    languageId: number;

    @Column({name:'code', type:'varchar', length: 50, nullable: false })
    code: string;

    @Column({name:'name', type:'varchar', length: 50, nullable: true })
    name: string; 

    @Column({name:'id_default', default:false})
    isDefault: boolean; 

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;

    
}