/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Person Controller
 *
 * @summary Account Status Type Controller
 * @author Favio Figueroa
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  :
 */
import { EntityManager } from 'typeorm';

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Authentication,
  Permission,
  Model, __, Log
} from '@pxp-nd/core';

import {AccountStatusType as AccountStatusTypeModel} from '../entities';

// @Route('/accountStatusType')
@Model('common/AccountStatusType')
class AccountStatusType extends Controller {

  /*  @Get()
    @DbSettings('Orm')
    @ReadOnly(true)
    async list(params: Record<string, unknown>): Promise<unknown> {
      console.log('paramssss',params)
      const listParam = this.getListParams(params);
      const [data, count] = await __(AccountStatusTypeModel.findAndCount(listParam)) as unknown[];
      return { data, count };
    }*/

  @Post()
  @DbSettings('Orm')
  @ReadOnly(false)
  @Log(true)
  async add(params: Record<string, unknown>, manager: EntityManager): Promise<AccountStatusTypeModel> {
    console.log('llega',params)
    const accountStatusType = new AccountStatusTypeModel();
    Object.assign(accountStatusType, params);
    accountStatusType.createdBy = (this.user.username as string);
    await __(this.classValidate(accountStatusType));
    await manager.save(accountStatusType);
    return accountStatusType;
  }
}

export default AccountStatusType;
