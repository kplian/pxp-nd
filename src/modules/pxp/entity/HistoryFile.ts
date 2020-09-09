import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn} from "typeorm";
import  File  from "./File";

@Entity({name:"tpar_history_file", schema: 'pxp'})
export default class HistoryFile {

    @PrimaryGeneratedColumn({name:'history_file_id'})
    historyFileId: number;

    @Column({name:'table_id', type:'integer', nullable: false })
    tableId: number;

    @Column({name:'version', type:'varchar', length: 500, nullable: true })
    version: string; 

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;


    @ManyToOne(type=> File, file=> file.historyFiles)
    @JoinColumn({name:"file_id"})
    file:File;
}
