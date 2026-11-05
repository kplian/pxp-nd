import { BaseEntity } from 'typeorm';
declare interface IAuthields {
  usernameField: string;
  passwordField: string;
}
declare interface IAuthLocal {
  verifyUser: any;
  fields: IAuthields;
}

declare interface IAuthJWT {
  verifyUser: any;
}

declare interface ISerialize {
  (userPayload: any, done: any): any;
}

declare interface IDeserialize {
  (userPayload: any, done: any): any;
}
declare interface IAuthPxp {
  serialize: ISerialize;
  deserialize: IDeserialize;
  local?: boolean |  IAuthLocal;
  jwt?: boolean | IAuthJWT;
}

declare interface IModule {
  entities?: any,
  controllers?: any[];
}

declare interface IModules {
  [name: string]: IModule;
}

declare interface IConfigExpress {
  [name: string]: any;
}

/**
 * Where a request audit line is written.
 * `db` (default) inserts into tsec_log and returns the numeric id.
 * `stdout` writes one JSON line and returns a uuid. No database.
 * `both` writes the line and inserts in the background; the uuid is stored
 * inside the row's request JSON as `__logId`.
 */
export type LogSink = 'db' | 'stdout' | 'both';

export interface IConfigPxpApp {
  defaultDbSettings?: string;
  apiPrefix?: string;
  logDuration?: boolean;
  /**
   * Audit destination. Omitted or `db` matches <=1.2.91 (insert into tsec_log).
   * `stdout` is one JSON line per request. `both` is the line plus a background insert.
   */
  logSink?: LogSink;
  showRoutes?: boolean;
  controllers?: any[];
  entities?: any;
  auth?: boolean | IAuthPxp;
  reports?: boolean;
  session?: any | BaseEntity;
  middlewares?: any[];
  scripts?: any[];
  modules?: IModules;
  enableSocket?: boolean;
  expressJsonConfig?: IConfigExpress;
  expressUrlEncodedConfig?: IConfigExpress;
  permissionFunction?: boolean | ((user:any, transaction:string) => Promise<boolean>);
  /** When true (or env API_EXPLORER_ENABLED=Y), mount Swagger UI at /explorer. Default off. */
  apiExplorerEnabled?: boolean;
  /** Authenticated OpenAPI URL the explorer loads. Tempo sets this. */
  apiExplorerOpenApiUrl?: string;
  /** Database safety options. All optional; when omitted the behaviour is identical to <=1.2.89. */
  db?: {
    /** Max ms to wait for a pool connection before a non-readonly route fails with 503. Undefined/0 = wait forever (legacy). */
    acquireTimeoutMs?: number;
  };
};
