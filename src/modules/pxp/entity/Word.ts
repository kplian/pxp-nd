import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import LanguageGroup from "./LanguageGroup";
import Translate from "./Translate";

@Entity({schema: 'pxp', name: "tpar_word"})
export default class Word {

    @PrimaryGeneratedColumn({name:'word_id'})
    wordId: number;

    @Column({name:'code', type:'varchar', length: 30, nullable: false })
    code: string;

    @Column({name:'text_default', type:'varchar', nullable: true })
    textDefault: string; 

    @CreateDateColumn ({ name: 'created_at'})
    createdAt: Date;

	@Column({name:'is_active', default:true})
    isActive: boolean;

    @ManyToOne(type=> LanguageGroup, languageGroup=> languageGroup.words)
    @JoinColumn({name:"language_group_id"})
    languageGroup:LanguageGroup;

    @OneToMany( type=> Translate, translate => translate.word,{eager:true,cascade:true})
    translatesW:Translate[];

}
