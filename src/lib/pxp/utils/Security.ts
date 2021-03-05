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
 * Last modified  : 2020-10-20 17:46:24
 */
import 'reflect-metadata';
import { getManager, EntityManager } from 'typeorm';
import Role from '../../../modules/pxp/entity/Role';
import Log from '../../../modules/pxp/entity/Log';

interface ScriptInterface {
  scriptCode: string,
  scriptFunction: (manager: EntityManager) => void
}


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
  query: string, req:  Record<string, unknown>, resp: string, err: string, timeEx: number, logConfig: Record<string, unknown>): Promise<number> => {

  for (const [key, value] of Object.entries(logConfig)) {
    if (key in req) {
      if (!value) {
        delete req[key];
      } else if (value === 'cc_mask') {
        const aux = req[key] as string;
        req[key] = '************' + aux.substr(-4);
      } else if (value === 'complete_mask') {
        const aux = req[key] as string;
        req[key] = aux.replace(/./g, '*');
      }
    }
  }
  const log = new Log();
  log.username = username;
  log.macaddres = macaddres;
  log.ip = ip;
  log.logType = logType;
  log.description = desc;
  log.procedure = proc;
  log.transaction = trans;
  log.query = query;
  log.request = JSON.stringify(req);
  log.response = resp;
  log.execTime = timeEx;
  log.errorCode = err;
  log.shortRequest = JSON.stringify(req).substring(0, 150);
  log.shortResponse = resp.substring(0, 150);


  const logIds = await getManager(process.env.DB_LOG_CONNECTION_NAME)
    .createQueryBuilder()
    .insert()
    .into(Log)
    .values([log])
    .execute();

  return logIds.identifiers[0].logId;
}

export { userHasPermission, insertLog, ScriptInterface };


