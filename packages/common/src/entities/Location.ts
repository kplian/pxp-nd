import {
	OneToMany,
	JoinColumn,
	ManyToOne,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	TreeChildren,
	TreeParent,
} from 'typeorm';
import { PxpEntity } from '../PxpEntity';


@Entity({ name: 'tcm_location' })
export default class Location extends PxpEntity {

	@PrimaryGeneratedColumn({ name: 'location_id' })
	locationId: number;

	@Column({ name: 'name', type: 'varchar', nullable: false })
	name: string;

	@Column({ name: 'code', type: 'varchar', nullable: false })
	code: string;

	@Column({ name: 'type', type: 'varchar', nullable: false })
	type: string;

	@TreeChildren()
  	children: Location[];

  	@TreeParent()
  	parent: Location;
}
