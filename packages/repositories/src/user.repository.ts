import { EntityRepository, Repository } from 'typeorm';

import {User} from '@pxp-nd/entities';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findOrCreateSocial(options: any, data: any): Promise<User> {
    const row = await this.findOne({
      where: {
        ...options
      }
    });
    if (row) {
      return Promise.resolve(row);
    } else {
      return this.save(data);
    }
  }
}
