import {
  EntityRepository,
  Repository,
  getRepository,
  getCustomRepository,
  getManager
} from 'typeorm';

import {AccountStatusType, AccountStatus} from '@pxp-nd/entities';
import moment from 'moment';
import { PxpError, __ } from '@pxp-nd/core';
import { validate } from 'class-validator';
export interface StatusData {
  accountStatus: any;
  accountStatusType: any;
}

@EntityRepository(AccountStatus)
class AccountStatusCustomRepository extends Repository<AccountStatus> {
  async saveStatus(data: StatusData, currentAccountId? : any): Promise<any | null> {
    const statusTypeRepo = getRepository(AccountStatusType);
    let accountStatus = null;
    let type = null;
    type = await statusTypeRepo.findOne({
      where: {
        code: data.accountStatusType.code
      }
    });

    if (!type) {
      type = await statusTypeRepo.save(data.accountStatusType);
    }

    const status = await this.findOne({
      where: {
        tableId: data.accountStatus.tableId
      }
    });

    const accountStatusDb: any = await this.findOne({
      join: {
        alias: 'account',
        innerJoin: { type: 'account.accountStatusType' }
      },
      where: (qb: any) => {
        qb.where({
          tableId: data.accountStatus.tableId,
          accountStatusId: currentAccountId,
        }).andWhere('type.code = :code', {
          code: data.accountStatusType.code
        });
      }
      // where: { tableId: purchaseId },
      // relations: ['accountStatusType']
    });
    
    
    const accountStatusId = currentAccountId || (accountStatusDb
      ? accountStatusDb.accountStatusId
      : null);
      
    if (accountStatusId) {
      data.accountStatus.description = !data.accountStatus.description ? accountStatusDb.description : data.accountStatus.description;
      accountStatus = await this.update(accountStatusId, {
        ...data.accountStatus
        // date: moment().format()
      });
      accountStatus = await this.findOne({
        where: {
          accountStatusId: accountStatusId
        }
      })
    } else {
      accountStatus = await this.save({
        ...data.accountStatus,
        accountStatusTypeId: type.accountStatusTypeId,
        // date: moment().format()
      });
    }
    return accountStatus;
  }

  async accountBalance(tableId: number, code: string): Promise<any | null> {
    const rawData = await this.query(`SELECT SUM(amount) as saldo 
                                            FROM tpar_account_status_type ast
                                                     JOIN tpar_account_status as acc
                                            ON acc.account_status_type_id = ast.account_status_type_id
                                            WHERE ast.code = '${code}'
                                              AND acc.table_id = ${tableId};`);
    return rawData[0]; 
  }

  async add(params: any, user: any): Promise<unknown>{
        // console.log('llega aca',params);
    const getAccountStatusTypeData = await getManager()
      .createQueryBuilder(AccountStatusType, 'astm')
      .where('astm.code = :code', { code: params.code })
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


    const accountStatus = new AccountStatus();
    Object.assign(accountStatus, params);
    accountStatus.createdBy = (user.username as string);
    accountStatus.date = moment().format('YYYY-MM-DD');
    accountStatus.accountStatusTypeId = getAccountStatusTypeData.account_status_type_id;
    accountStatus.amount = amount;

    const errors = await __(validate(accountStatus)) as unknown[];

    if (errors.length > 0) {
      throw new PxpError(
        406,
        'Validation failed!',
        (errors as unknown) as undefined
      );
    }

    await this.save(accountStatus);
    return accountStatus;
  } 
}

export const accountStatusRepository = () =>
  getCustomRepository(AccountStatusCustomRepository);
