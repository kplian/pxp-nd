/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Person Controller
 *
 * @summary Account Status Controller
 * @author Favio Figueroa
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  :
 */
import { EntityManager, getManager } from 'typeorm';

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
} from '../../../lib/pxp';

import AccountStatusModel from '../entity/AccountStatus';
import PersonModel from '../../pxp/entity/Person';
import AccountStatusTypeModel from '../entity/AccountStatusType';

// @Route('/accountStatusType')
@Model('params/AccountStatus')
class AccountStatus extends Controller {

  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async list(params: Record<string, unknown>): Promise<unknown> {
    const listParam = this.getListParams(params);
    let qb = await getManager()
      .createQueryBuilder(AccountStatusModel, 'asm')
      .innerJoinAndSelect('asm.accountStatusType', 'ast')
      // .where('"ast".code = :code', { code: params.code })
      .where(params.code ? 'ast.code = :code' : '1=1', { code: params.code })
      .andWhere(params.tableId ? 'asm.table_id = :tableId' : '1=1', { tableId: params.tableId });

    if(params.genericFilterFields && params.genericFilterValue){
      const genericFilterFields = params.genericFilterFields as string;
      const filterFieldsArray = genericFilterFields.split('#');
      filterFieldsArray.forEach((field) => {
        qb = qb.andWhere(`${field}::varchar like :value`, { value:`%${params.genericFilterValue}%` });
      });
    }

    const count = await qb.select('count(*) as count, sum(asm.amount) as total_amount').getRawOne();
    const data = await qb.offset(params.start as number).limit(params.limit as number).select('ast.code, ast.type, asm.amount, asm.description')
      .getRawMany();

    console.log(count)
    return {  data, count: count.count, dataFooter:{totalAmount: count.total_amount, totalRange: 120} };

  }

  @Post()
  @DbSettings('Orm')
  @ReadOnly(false)
  @Log(true)
  async add(params: Record<string, unknown>, manager: EntityManager): Promise<AccountStatusModel> {
    console.log('llega aca');
    const getAccountStatusTypeData = await getManager()
      .createQueryBuilder(AccountStatusTypeModel, 'astm')
      .where('"astm".code = :code', { code: params.code })
      .select('astm.account_status_type_id as account_status_type_id').getRawOne();

    console.log('getAccountStatusTypeData',getAccountStatusTypeData)

    const accountStatus = new AccountStatusModel();
    Object.assign(accountStatus, params);
    accountStatus.createdBy = (this.user.username as string);
    accountStatus.accountStatusTypeId = getAccountStatusTypeData.account_status_type_id;
    await __(this.classValidate(accountStatus));
    await manager.save(accountStatus);
    return accountStatus;
  }



}

export default AccountStatus;
