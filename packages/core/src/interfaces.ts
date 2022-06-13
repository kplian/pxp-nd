import { BaseEntity } from 'typeorm';
declare interface IAuthields {
  usernameField: string;
  passwordField: string;
}
declare interface IAuthLocal {
  verifyUser: any;
  fields: IAuthields;
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
  jwt?: boolean | any;
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

export interface IConfigPxpApp {
  defaultDbSettings?: string;
  apiPrefix?: string;
  logDuration?: boolean;
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
};
