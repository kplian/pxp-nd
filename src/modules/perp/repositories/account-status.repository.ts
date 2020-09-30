import {
  EntityRepository,
  Repository,
  getRepository,
  getCustomRepository
} from 'typeorm';

import { AccountStatus } from '../entity/AccountStatus';
import { AccountStatusType } from '../entity/AccountStatusType';
import moment from 'moment';
import { log } from 'console';
export interface StatusData {
  accountStatus: AccountStatus;
  accountStatusType: AccountStatusType;
}

@EntityRepository(AccountStatus)
class AccountStatusCustomRepository extends Repository<AccountStatus> {
  async saveStatus(data: StatusData): Promise<any | null> {
    const accountStatusDb: any = await this.findOne({
      join: {
        alias: 'account',
        innerJoin: { type: 'account.accountStatusType' }
      },
      where: (qb:any) => {
        qb.where({
          relatedId: data.accountStatus.relatedId
        }).andWhere('type.tableName = :tableName', {
          tableName: data.accountStatusType.tableName
        });
      }
      // where: { relatedId: purchaseId },
      // relations: ['accountStatusType']
    });

    console.log('[ACC]', accountStatusDb);
    

    const accountStatusId = accountStatusDb
      ? accountStatusDb.accountStatusId
      : null;

    const statusTypeRepo = getRepository(AccountStatusType);
    let accountStatus = null;

    if (accountStatusId) {
      accountStatus = await this.update(
        accountStatusId,
        {
          ...data.accountStatus,
          date: moment().format()
        }
      );
    } else {
      const statusType = await statusTypeRepo.save(data.accountStatusType);
      if (statusType) {
        accountStatus = await this.save({
          ...data.accountStatus,
          accountStatusTypeId: statusType.accountStatusTypeId,
          date: moment().format()
        });
      }
    }
    return accountStatus;
  }
}

export const accountStatusRepository = () =>
  getCustomRepository(AccountStatusCustomRepository);
 
