import { EntityRepository, Repository, getRepository } from 'typeorm';

import { AccountStatus } from '../entity/AccountStatus';
import { AccountStatusType } from '../entity/AccountStatusType';

export interface StatusData {
  accountStatus: AccountStatus;
  accountStatusType: AccountStatusType;
}

@EntityRepository(AccountStatus)
export class AccountStatusRepository extends Repository<AccountStatus> {
  async saveStatus(data: StatusData): Promise<AccountStatus | null> {
    const statusTypeRepo = getRepository(AccountStatusType);
    const statusType = await statusTypeRepo.save(data.accountStatusType);
    let accountStatus = null;
    if (statusType) {
      accountStatus = await this.save({
        ...data.accountStatus,
        accountStatusTypeId: statusType.accountStatusTypeId
      });
    }
    return accountStatus;
  }
}
