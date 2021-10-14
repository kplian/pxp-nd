import {
	OneToMany,
	JoinColumn,
	ManyToOne,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
} from 'typeorm';
import { PxpEntity } from '@pxp-nd/entities';

@Entity({ name: 'tpar_currency' })
export default class Currency extends PxpEntity {

	@PrimaryGeneratedColumn({ name: 'currency_id' })
	currencyId: number;
  
  @Column({ name: 'code', type: 'varchar', nullable: false })
  code: string;
  
  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;
  
  @Column({ name: 'type', type: 'varchar', nullable: false })
  type: string;
  
  @Column({ name: 'priority', type: 'varchar', nullable: false })
  priority: number;
  
  @Column({ name: 'source', type: 'varchar', nullable: false })
  source: string;
  
  @Column({ name: 'update_yn', type: 'varchar', nullable: false })
  updateYn: string;
  
  @Column({ name: 'triangulation_yn', type: 'varchar', nullable: false })
  triangulationYn: string;
  
}
