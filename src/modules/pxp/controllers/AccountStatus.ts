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
import { start } from 'repl';
import { accountStatusRepository } from '../repositories/account-status.repository';

// @Route('/accountStatusType')
@Model('pxp/AccountStatus')
class AccountStatus extends Controller {

  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async list(params: Record<string, unknown>): Promise<unknown> {
    // const listParam = this.getListParams(params);

    let qb = await getManager()
      .createQueryBuilder(AccountStatusModel, 'asm')
      .innerJoinAndSelect('asm.accountStatusType', 'ast')
      // .where('"ast".code = :code', { code: params.code })
      .where(params.code ? 'ast.code = :code' : '1=1', { code: params.code })
      .andWhere(params.tableId ? 'asm.table_id = :tableId' : '1=1', { tableId: params.tableId });

    // get initial balance
    const startDate = params.startDate; // todo change now
    const endDate = params.endDate;
    let initialBalance;
    if(startDate && endDate) {
      const qbInitialBalance = await qb.clone();
       initialBalance = await qbInitialBalance.select('count(*) as count_initial_balance, sum(asm.amount) as sum_initial_balance')
        .andWhere((params.startDate && params.endDate) ? 'asm.date < :start' : '1=1', { start: startDate })
        .getRawOne();

      qb = qb.andWhere('asm.date BETWEEN :start AND :end', { start: startDate, end: endDate });

    } else {
      initialBalance = {
        count_initial_balance: 0,
        sum_initial_balance: 0,
      };
    }


//      .andWhere((params.startDate && params.endDate) ? 'asm.date BETWEEN :start AND :end' : '1=1', { start: params.startDate, end: params.endDate });


    if(params.genericFilterFields && params.genericFilterValue){
      const genericFilterFields = params.genericFilterFields as string;
      const filterFieldsArray = genericFilterFields.split('#');
      filterFieldsArray.forEach((field) => {
        qb = qb.andWhere(`${field}::varchar like :value`, { value:`%${params.genericFilterValue}%` });
      });
    }

    const count = await qb.select('count(*) as count, sum(asm.amount) as total_amount').getRawOne();
    const data = await qb.offset(params.start as number).limit(params.limit as number).select('asm.account_status_id, ast.code, ast.type, asm.amount, asm.description, asm.date, asm.typeTransaction')
      .getRawMany();

    const initialBalanceAux = initialBalance.sum_initial_balance || 0;
    const totalAmount = count.total_amount || 0;
    const totalBalance = parseFloat(initialBalanceAux) + parseFloat(totalAmount);
    console.log(count)
    return {  data, count: count.count, extraData:{totalAmount: count.total_amount || 0, totalBalance, totalRange: 120, initialBalance: { count_initial_balance: initialBalance.count_initial_balance || 0, sum_initial_balance: initialBalance.sum_initial_balance || 0,  } } };

  }

  @Post()
  @DbSettings('Orm')
  @ReadOnly(false)
  @Log(true)
  async add(params: Record<string, unknown>, manager: EntityManager): Promise<unknown> {
    console.log('llega aca',params);
    const getAccountStatusTypeData = await getManager()
      .createQueryBuilder(AccountStatusTypeModel, 'astm')
      .where('"astm".code = :code', { code: params.code })
      .select('astm.account_status_type_id as account_status_type_id').getRawOne();

    console.log('getAccountStatusTypeData',getAccountStatusTypeData)

    /*
    account payable (positive)
    account receivable (positive)
    payment in advance (negative)
    payment (negative)
    adjusting account (from client)
    * */
    let amount = params.amount as number;
    switch (params.typeTransaction) {
      case 'account_payable':
      case 'account_receivable':
        if (Math.sign(amount) === -1) { // the amount is negative from client
          // the value must be a positive
          amount = amount * -1;
        }
        break;
      case 'payment_in_advance':
      case 'payment':
        if (Math.sign(amount) === 1) { // the amount is positive from client
          // the value must be a negative
          amount = amount * -1;
        }
        break;
      default: // adjusting_account
        console.log('type transaction is not exist in the config')
    }

    console.log(amount);


    const accountStatus = new AccountStatusModel();
    Object.assign(accountStatus, params);
    accountStatus.createdBy = (this.user.username as string);
    accountStatus.accountStatusTypeId = getAccountStatusTypeData.account_status_type_id;
    accountStatus.amount = amount;
    await __(this.classValidate(accountStatus));
    await manager.save(accountStatus);
    return accountStatus;
  }

  @Get('/balance')
  @DbSettings('Orm')
  @ReadOnly(false)
  @Log(true)
  async getBalance(params: Record<string, unknown>, manager: EntityManager): Promise<any> {
    console.log(params);
    
    return await accountStatusRepository().accountBalance(Number(params.tableId), String(params.code));
  }

}

export default AccountStatus;
