/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * long description for the file
 *
 * @summary short description for the file
 * @author No author
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-09-17 18:58:45
 */
import { Entity, PrimaryGeneratedColumn, Column, AfterLoad } from 'typeorm';
import { IsInt, Length, IsEmail, IsDate, IsOptional } from 'class-validator';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ schema: 'pxp', name: 'tsec_person' })
export default class Person extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'person_id' })
  personId: number;

  @Length(2, 150)
  @Column({ name: 'name', type: 'varchar', length: 150, nullable: false })
  name: string;

  @Length(2, 150)
  @IsOptional()
  @Column({ name: 'last_name', type: 'varchar', length: 150, nullable: true })
  lastName: string;

  @Length(2, 150)
  @IsOptional()
  @Column({ name: 'last_name2', type: 'varchar', length: 150, nullable: true })
  lastName2: string;

  @Column({ name: 'dni', type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  dni: string;

  @IsInt()
  @IsOptional()
  @Column({ name: 'dni_number', type: 'varchar', length: 50, nullable: true })
  dniNumber: string;

  @IsEmail()
  @IsOptional()
  @Column({ name: 'mail', type: 'varchar', length: 50, nullable: true })
  mail: string;

  @IsOptional()
  @Column({ name: 'address', type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ name: 'gender', type: 'varchar', length: 2, nullable: false, default: 'M' })
  gender: string;

  @IsOptional()
  @IsDate()
  @Column({ name: 'birthday', type: 'date', nullable: true })
  birthday: Date;

  @IsOptional()
  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  @IsOptional()
  @Column({ name: 'cellphone', type: 'varchar', length: 20, nullable: true })
  cellphone: string;

  @Column({ name: 'nationality', type: 'varchar', length: 100, nullable: false, default: 'Bolivian' })
  nationality: string;

  fullName: string;
  fullName2: string;

  @AfterLoad()
  setComputed(): void {
    this.fullName = [this.name, this.lastName, this.lastName2].join(' ');
    this.fullName2 = [this.lastName, this.lastName2, this.name].join(' ');
  }

}