/**
 * Kplian Ltda 2021
 *
 * MIT
 *
 * Role Controller
 *
 * @summary Role Controller
 * @author Israel Cm
 *
 * Created at     : 2021-10-04 18:55:38
 * Last modified  : 2021-10-04 19:04:30
 */
import { EntityManager, Timestamp, } from 'typeorm';
import { getManager } from 'typeorm';
import Joi from 'joi';
import {
  Controller,
  Get,
  Post,
  Route,
  Model,
  __,
  Patch
} from '@pxp-nd/core';
import { genPassword } from '@pxp-nd/auth';
import {User as UserModel} from '../entities';
import {Person} from '../entities';
import {Role as ERole} from '../entities';

@Route('/roles')
@Model('common/Role')
class Role extends Controller {
  @Get('/', { authentication: false })
  async paginate(params: Record<string, unknown>): Promise<any> {
    const [data, count] = await getManager().findAndCount(ERole);
    return {data, count};
  }

  @Post('/', { authentication: false, readOnly: false })
  async save(params: Record<string, unknown>): Promise<ERole> {
    const schema = Joi.object({
      role: Joi.string().uppercase().trim().required().replace(/[',"]/gi, ''),
      description: Joi.string().trim(),
    });
    const values = await schema.validateAsync(params);
    const role = await getManager().save(ERole, values);
    return role;
  } 

  @Patch('/:roleId', { authentication: false, readOnly: false })
  async update(params: Record<string, unknown>): Promise<any> {
    const schema = Joi.object({
      roleId: Joi.number().required(),
      role: Joi.string().uppercase().trim().required().replace(/[',"]/gi, ''),
      description: Joi.string().trim(),
    });
    const values = await schema.validateAsync(params);
    const role = await getManager().update(ERole, values.roleId, values);
    return role;
  } 
}

export default Role;
