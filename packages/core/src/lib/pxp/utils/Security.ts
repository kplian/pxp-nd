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
 * Last modified  : 2026-11-04 - Rensi Arteaga - stdout request source for CloudWatch audit
 */
 import 'reflect-metadata';
 import crypto from 'crypto';
 import { getManager, EntityManager } from 'typeorm';
 // import { Role } from '@pxp-nd/entities';
 import Log from '../../../entities/Log';
 import { IPermissionContext, LogSink } from '../../../interfaces';

 /** Max characters kept for request, response and query on a stdout line. CloudWatch drops an event past 256 KB. */
 const STDOUT_LOG_FIELD_MAX = 8192;

 export type RequestLogSource = 'user' | 'agent';

 export interface RequestLogAudit {
   source?: RequestLogSource;
   agentSource?: string;
 }

 const normalizeRequestLogAudit = (audit?: RequestLogAudit): { source: RequestLogSource; agentSource?: string } => {
  const source = audit?.source === 'agent' ? 'agent' : 'user';
  if (source === 'agent' && audit?.agentSource) {
    return { source, agentSource: audit.agentSource };
  }
  return { source };
 };
 
 interface ScriptInterface {
   scriptCode: string,
   scriptFunction: (manager: EntityManager) => void
 }
 
 
 const userHasPermission = async (user: any, transaction: string, permissionFunction: undefined | boolean | ((user:any, transaction:string, context?: IPermissionContext) => Promise<boolean>), context?: IPermissionContext): Promise<boolean> => {
    if (typeof permissionFunction === 'function') {
      return await permissionFunction(user, transaction, context);
    } else {
      /*const userRes = await getManager()
      .createQueryBuilder(Role, 'role')
      .innerJoinAndSelect('role.uis', 'ui')
      .innerJoin('role.users', 'user')
      .innerJoin('ui.transactions', 'uiTran')
      .innerJoin('uiTran.transaction', 'transac')
      .select('COUNT(*) AS count')
      .where('"user".user_id = :userId', { userId: user.userId })
      .andWhere('transac.code= :codeTrans', { codeTrans: transaction })
      .getRawOne();
 
      return userRes.count === '0' ? false : true;*/
      return true
    }
   
 
 };
 
 
 /** uuid v4. @types/node 15 does not declare crypto.randomUUID. */
 const newLogId = (): string => {
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
 };

 const applyLogMask = (req: Record<string, unknown>, logConfig: Record<string, unknown>): void => {
  if (!logConfig || !req) {
    return;
  }
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
 };

 const capField = (value: string): { text: string; truncated: boolean } => {
  const text = value == null ? '' : String(value);
  if (text.length <= STDOUT_LOG_FIELD_MAX) {
    return { text, truncated: false };
  }
  return { text: text.slice(0, STDOUT_LOG_FIELD_MAX), truncated: true };
 };

 const serializeForLog = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '{"error":"unserializable"}';
  }
 };

 const emitStdoutLog = (
  logId: string,
  username: string,
  ip: string,
  logType: string,
  desc: string,
  proc: string,
  trans: string,
  query: string,
  req: Record<string, unknown>,
  resp: string,
  err: string,
  timeEx: number,
  audit?: RequestLogAudit
 ): void => {
  const request = capField(serializeForLog(req));
  const response = capField(resp);
  const queryField = capField(query);
  const { source, agentSource } = normalizeRequestLogAudit(audit);
  const line: Record<string, unknown> = {
    pxpLog: true,
    logId,
    type: logType,
    user: username,
    source,
    ip,
    module: proc,
    transaction: trans,
    status: err,
    ms: timeEx,
    message: desc,
    query: queryField.text,
    request: request.text,
    response: response.text,
    truncated: request.truncated || response.truncated || queryField.truncated,
  };
  if (agentSource) {
    line.agentSource = agentSource;
  }
  console.log(JSON.stringify(line));
 };

 const insertLogRow = async (username: string, macaddres: string, ip: string, logType: string, desc: string, proc: string, trans: string,
   query: string, req: Record<string, unknown>, resp: string, err: string, timeEx: number): Promise<number> => {
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
   log.shortResponse = (resp || '').substring(0, 150);

   const logIds = await getManager(process.env.DB_LOG_CONNECTION_NAME)
     .createQueryBuilder()
     .insert()
     .into(Log)
     .values([log])
     .execute();

   return logIds.identifiers[0].logId;
 };

 const insertLog = async (username: string, macaddres: string, ip: string, logType: string, desc: string, proc: string, trans: string,
   query: string, req:  Record<string, unknown>, resp: string, err: string, timeEx: number, logConfig: Record<string, unknown>,
   logSink: LogSink = 'db', audit?: RequestLogAudit): Promise<number | string> => {
  const sink = logSink || 'db';
  if (sink === 'stdout' || sink === 'both') {
    const snapshot: Record<string, unknown> = { ...(req || {}) };
    applyLogMask(snapshot, logConfig);
    const logId = newLogId();
    emitStdoutLog(logId, username, ip, logType, desc, proc, trans, query, snapshot, resp, err, timeEx, audit);
    if (sink === 'both') {
      const dbReq = { ...snapshot, __logId: logId };
      insertLogRow(username, macaddres, ip, logType, desc, proc, trans, query, dbReq, resp, err, timeEx)
        .catch((dbErr) => console.error('[pxp-core] db log failed', dbErr && (dbErr.tecMessage || dbErr.message)));
    }
    return logId;
  }

  applyLogMask(req, logConfig);
  return insertLogRow(username, macaddres, ip, logType, desc, proc, trans, query, req, resp, err, timeEx);
 }
 
 export { userHasPermission, insertLog, STDOUT_LOG_FIELD_MAX };
 export type { ScriptInterface };
 
 
 