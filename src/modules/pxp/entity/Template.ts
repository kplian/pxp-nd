/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Person Controller
 *
 * @summary Account Status Entity
 * @author Favio Figueroa
 *
 * Created at     : 2021-03-10 18:55:38
 * Last modified  :
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

import { PxpEntity } from '../../../lib/pxp';


@Entity({ name: 'tpar_template' })

export default class Template extends PxpEntity {

  @PrimaryGeneratedColumn({name:'template_id'})
  templateId: number;

  @Column({ name: 'name', type: 'varchar', length: 500, nullable: true })
  name: string;

  @Column({ name: 'html_template', type: 'text', nullable: true })
  htmlTemplate: string;

  @Column({ name: 'json_template', type: 'text', nullable: true })
  jsonTemplate: string;


}
