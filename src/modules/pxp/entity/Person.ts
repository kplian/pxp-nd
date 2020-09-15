import { Entity, PrimaryGeneratedColumn, Column, AfterLoad } from 'typeorm';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tsec_person' })
export default class Person extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'person_id' })
  personId: number;

  @Column({ name: 'name', type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ name: 'last_name', type: 'varchar', length: 150, nullable: true })
  lastName: string;

  @Column({ name: 'last_name2', type: 'varchar', length: 150, nullable: true })
  lastName2: string;

  @Column({ name: 'dni', type: 'varchar', length: 20, nullable: true })
  dni: string;

  @Column({ name: 'dni_number', type: 'varchar', length: 50, nullable: true })
  dniNumber: string;

  @Column({ name: 'mail', type: 'varchar', length: 50, nullable: true })
  mail: string;

  @Column({ name: 'address', type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ name: 'gender', type: 'varchar', length: 2, nullable: false, default: 'M' })
  gender: string;

  @Column({ name: 'birthday', type: 'date', nullable: true })
  birthday: Date;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

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