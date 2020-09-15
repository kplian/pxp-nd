import 'reflect-metadata';
import { getManager } from 'typeorm';
import Role from '../../modules/pxp/entity/Role';

const userHasPermission = async (userId: number, transaction: string): Promise<boolean> => {

  const user = await getManager()
    .createQueryBuilder(Role, 'role')
    .innerJoinAndSelect('role.uis', 'ui')
    .innerJoin('role.users', 'user')
    .innerJoin('ui.transactions', 'uiTran')
    .innerJoin('uiTran.transaction', 'transac')
    .select('COUNT(*) AS count')
    .where('"user".user_id = :userId', { userId: userId })
    .andWhere('transac.code= :codeTrans', { codeTrans: transaction })
    .getRawOne();

  return user.count == '0' ? false : true;

};
export { userHasPermission };


