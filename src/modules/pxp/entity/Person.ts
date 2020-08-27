import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";


@Entity({schema: 'pxp', name: "tsec_person"})
export class Person {

    @PrimaryGeneratedColumn()
    person_id: number;

    @Column({type: "varchar", length: 150, nullable:false})
    name: string;

    @Column({type:"varchar", length: 100, nullable:true})
    last_name_first: string;

    @Column({type:"varchar", length: 100,nullable:true})
    last_name_second: string;

    @Column({type:"varchar", length: 20, nullable:false})
    dni: string;

    @Column({type:"varchar", length: 20, nullable:false})
    dni_number: string;

    @Column({type:"varchar", length: 50, nullable:true})
    mail: string;

    @Column({type:"varchar", length: 250, nullable:true})
    address: string;

    @Column({type:"varchar", length: 15, nullable:false, default:'M'})
    gender: string;

    @Column({type:"date",nullable:true})
    birthday: Date;

    @Column({type:"varchar", length: 20,nullable:true})
    phone: string;

    @Column({type:"varchar", length: 20,nullable:true})
    cellphone: string;

    @Column({type:"varchar", length: 100, nullable:false, default:'Bolivian'})
    nationality: string;

    @CreateDateColumn({ name: 'created_at'})
    created_at: Date;

	@Column({name:'is_active', default:true})
    is_active: boolean;

    @Column({type:"varchar", length: 80, nullable:true, default:'local'})
    user_reg: string;



}