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
  local: boolean |  IAuthLocal;
  jwt: boolean | any;
} 
export interface IConfigPxpApp {
  defaultDbSettings?: string;
  apiPrefix?: string;
  logDuration?: boolean;
  showRoutes?: boolean;
  controllers?: any[];
  auth?: boolean | IAuthPxp; 
  session?: any | BaseEntity;
};
