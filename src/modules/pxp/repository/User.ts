import { EntityRepository, Repository } from 'typeorm';

import { User } from '../entity/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findOrCreateSocial(options: any, data: User): Promise<User> {
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
