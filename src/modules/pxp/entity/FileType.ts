import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany} from "typeorm";
import  File  from "./File";
//, OneToOne, JoinColumn
@Entity({schema: 'pxp', name: "tpar_file_type"})
export default class FileType {

    @PrimaryGeneratedColumn({name:'file_type_id'})
    fileTypeId: number;

    @Column({name:'table_name', type:'varchar', length: 100, nullable: true })
    tableName: string;

    @Column({name:'code', type:'varchar', length: 100, nullable: true })
    code: string; 

    @Column({name:'name', type:'varchar', length: 100, nullable: true })
    name: string;

    @Column({name:'extension', type:'varchar', length: 100, nullable: true })
    extension: string; 

    @Column({name:'max_size', type:'varchar', length: 100, nullable: true })
    max_size: string;

    @Column({name:'order', type:'integer', nullable: true })
    order: number; 

    @Column({name:'multiple', type:'varchar', length: 100, nullable: true })
    multiple: string;

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;

    @OneToMany (type=> File,file => file.fileType)
    files:File[];
}