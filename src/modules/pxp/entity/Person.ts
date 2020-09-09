import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


@Entity({ schema: 'pxp', name: 'tsec_person' })
export default class Person {

  @PrimaryGeneratedColumn({name:'person_id'})
  personId: number;

  @Column({name:'name', type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ name:'last_name_first', type: 'varchar', length: 100, nullable: true })
  lastNameFirst: string;

  @Column({ name:'last_name_second', type: 'varchar', length: 100, nullable: true })
  lastNameSecond: string;

  @Column({ name:'dni', type: 'varchar', length: 20, nullable: false })
  dni: string;

  @Column({ name:'dni_number', type: 'varchar', length: 20, nullable: false })
  dniNumber: string;

  @Column({ name:'mail', type: 'varchar', length: 50, nullable: true })
  mail: string;

  @Column({ name:'address', type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ name:'gender', type: 'varchar', length: 15, nullable: false, default: 'M' })
  gender: string;

  @Column({ name:'birthday', type: 'date', nullable: true })
  birthday: Date;

  @Column({ name:'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name:'cellphone', type: 'varchar', length: 20, nullable: true })
  cellphone: string;

  @Column({ name:'nationality', type: 'varchar', length: 100, nullable: false, default: 'Bolivian' })
  nationality: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name:'user_reg', type: 'varchar', length: 80, nullable: true, default: 'local' })
  userReg: string;



}