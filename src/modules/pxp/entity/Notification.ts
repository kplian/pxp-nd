import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import PxpEntity from './PxpEntity';

@Entity({ schema: 'pxp', name: 'tpar_notification' })
export default class Notification extends PxpEntity {

  @PrimaryGeneratedColumn({ name: 'notification_id' })
  notificationId: number;

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: false })
  type: string;

  @Column({ name: 'tittle', type: 'varchar', length: 50, nullable: false })
  tittle: string;

  @Column({ name: 'status', type: 'varchar', length: 50, nullable: false })
  status: string;

  @Column({ name: 'description', type: 'text', nullable: false })
  description: string;

  @Column({ name: 'url', type: 'varchar', length: 50, nullable: true })
  url: string;

}