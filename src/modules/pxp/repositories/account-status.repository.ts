import {
  EntityRepository,
  Repository,
  getRepository,
  getCustomRepository
} from 'typeorm';

import AccountStatus from '../entity/AccountStatus';
import AccountStatusType from '../entity/AccountStatusType';
import moment from 'moment';
export interface StatusData {
  accountStatus: any;
  accountStatusType: any;
}

@EntityRepository(AccountStatus)
class AccountStatusCustomRepository extends Repository<AccountStatus> {
  async saveStatus(data: StatusData): Promise<any | null> {
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
          tableId: data.accountStatus.tableId
        }).andWhere('type.code = :code', {
          code: data.accountStatusType.code
        });
      }
      // where: { tableId: purchaseId },
      // relations: ['accountStatusType']
    });

    const accountStatusId = accountStatusDb
      ? accountStatusDb.accountStatusId
      : null;

    if (accountStatusId) {
      accountStatus = await this.update(accountStatusId, {
        ...data.accountStatus
        // date: moment().format()
      });
    } else {
      accountStatus = await this.save({
        ...data.accountStatus,
        accountStatusTypeId: type.accountStatusTypeId,
        date: moment().format()
      });
    }
    return accountStatus;
  }
}

export const accountStatusRepository = () =>
  getCustomRepository(AccountStatusCustomRepository);
