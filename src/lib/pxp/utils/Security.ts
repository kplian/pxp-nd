/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Common security functions
 *
 * @summary Common security functions.
 * @author Mercedes Zambrana
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:54:46
 */
import 'reflect-metadata';
import { getManager } from 'typeorm';
import Role from '../../../modules/pxp/entity/Role';
import Log from '../../../modules/pxp/entity/Log';


const userHasPermission = async (userId: number, transaction: string): Promise<boolean> => {

  const user = await getManager()
    .createQueryBuilder(Role, 'role')
    .innerJoinAndSelect('role.uis', 'ui')
    .innerJoin('role.users', 'user')
    .innerJoin('ui.transactions', 'uiTran')
    .innerJoin('uiTran.transaction', 'transac')
    .select('COUNT(*) AS count')
    .where('"user".user_id = :userId', { userId })
    .andWhere('transac.code= :codeTrans', { codeTrans: transaction })
    .getRawOne();

  return user.count === '0' ? false : true;

};


const insertLog = async (username: string, macaddres: string, ip: string, logType: string, desc: string, proc: string, trans: string,
  query: string, req: string, resp: string, err: string, timeEx: number): Promise<number> => {

  const log = new Log();
  log.username = username;
  log.macaddres = macaddres;
  log.ip = ip;
  log.logType = logType;
  log.description = desc;
  log.procedure = proc;
  log.transaction = trans;
  log.query = query;
  log.request = req;
  log.response = resp;
  log.execTime = timeEx;
  log.errorCode = err;


  const logIds = await getManager()
    .createQueryBuilder()
    .insert()
    .into(Log)
    .values([log])
    .execute();

  return logIds.identifiers[0].logId;

}
export { userHasPermission, insertLog };


