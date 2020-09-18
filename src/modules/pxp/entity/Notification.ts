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
 * Last modified  : 2020-09-18 13:47:45
 */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PxpEntity } from '../../../lib/pxp';

@Entity({ name: 'tpar_notification' })
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