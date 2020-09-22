import express from 'express';
import { getManager, UpdateResult } from 'typeorm';
import Controller, {
  Get,
  Route,
  Post,
  Patch,
  Delete,
  DbSettings,
  ReadOnly
} from '../../../lib/Controller';
import { AccountStatusType as AccountStatusTypeModel } from '../entity/AccountStatusType';

@Route('/acount-status-type')
class AccountStatus extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async find(
    params: Record<string, unknown>
  ): Promise<AccountStatusTypeModel[]> {
    const accountStatus = await getManager().find(AccountStatusTypeModel);
    return accountStatus;
  }

  @Get('/find/:type')
  @DbSettings('Orm')
  @ReadOnly(true)
  async findbyType(
    params: Record<string, unknown>
  ): Promise<AccountStatusTypeModel[]> {
    const accountStatus = await getManager().find(AccountStatusTypeModel, {
      where: {
        type: params.type
      }
    });
    return accountStatus;
  }

  @Post()
  @ReadOnly(true)
  @DbSettings('Orm')
  async save(params: any): Promise<AccountStatusTypeModel> {
    const acountStatusType = await getManager().save(AccountStatusTypeModel, {
      ...params
    });
    return acountStatusType;
  }

  @Patch('/edit/:id')
  @ReadOnly(true)
  @DbSettings('Orm')
  async edit(params: any): Promise<any> {
    console.log(params);
    const id = params.id;
    delete params.id;
    await getManager().update(AccountStatusTypeModel, id, {
      ...params
    });

    const acountStatusType = await getManager().findOne(
      AccountStatusTypeModel,
      {
        where: { acountStatusTypeId: id }
      }
    );
    return acountStatusType;
  }

  @Delete('/delete/:id')
  @ReadOnly(true)
  @DbSettings('Orm')
  async delete(params: any): Promise<any> {
    const acountStatusType = await getManager().delete(AccountStatusTypeModel, {
      acountStatusTypeId: params.id
    });
    return acountStatusType;
  }
}

export default AccountStatus;
