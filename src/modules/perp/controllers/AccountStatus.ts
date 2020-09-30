import express from 'express';
import { getManager, UpdateResult } from 'typeorm';
import { Controller } from '../../../lib/pxp/Controller';
import {
  Get,
  Route,
  Post,
  Patch,
  Delete,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model
} from '../../../lib/pxp/Decorators';
import { AccountStatus as AccountStatusModel } from '../entity/AccountStatus';

@Route('/acount-status')
class AccountStatus extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async find(params: Record<string, unknown>): Promise<AccountStatusModel[]> {
    const accountStatus = await getManager().find(AccountStatusModel, {
      relations: ['accountStatusType']
    });

    return accountStatus.map((as: any) => {
      return {
        ...as,
        type: as.accountStatusType ? as.accountStatusType.type : null
      };
    });
  }

  @Get('/find/:type')
  @DbSettings('Orm')
  @ReadOnly(true)
  async findbyType(
    params: Record<string, unknown>
  ): Promise<AccountStatusModel[]> {
    const accountStatus = await getManager().find(AccountStatusModel, {
      where: {
        type: params.type
      }
    });
    return accountStatus;
  }

  @Post()
  @ReadOnly(true)
  @DbSettings('Orm')
  async save(params: any): Promise<AccountStatusModel> {
    const acountStatus = await getManager().save(AccountStatusModel, {
      ...params
    });
    return acountStatus;
  }

  @Patch('/edit/:id')
  @ReadOnly(true)
  @DbSettings('Orm')
  async edit(params: any): Promise<any> {
    console.log(params);
    const id = params.id;
    delete params.id;
    await getManager().update(AccountStatusModel, id, {
      ...params
    });

    const acountStatus = await getManager().findOne(AccountStatusModel, {
      where: { acountStatusId: id }
    });
    return acountStatus;
  }

  @Delete('/delete/:id')
  @ReadOnly(true)
  @DbSettings('Orm')
  async delete(params: any): Promise<any> {
    const acountStatus = await getManager().delete(AccountStatusModel, {
      acountStatusId: params.id
    });
    return acountStatus;
  }
}

export default AccountStatus;
