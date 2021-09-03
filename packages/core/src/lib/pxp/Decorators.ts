/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * All Pxp Decorators.
 *
 * @summary Pxp decorators.
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:29:51
 */
import { RouteDefinition, Method } from './RouteDefinition';
export declare interface IOptionsRoute {
  readOnly?: boolean;
  dbSettings?: 'Procedure' | 'Orm' | 'Query';
  authentication?: boolean;
};

const setProperty =  (target: any, propertyKey: string) => (value: any, name: string) => {
  if (!Reflect.hasMetadata(name, target.constructor)) {
    Reflect.defineMetadata(name, [], target.constructor);
  }
  const valueName = Reflect.getMetadata(name, target.constructor) as {
    [id: string]: boolean;
  };
  valueName[propertyKey] = value;
  Reflect.defineMetadata(name, valueName, target.constructor);
};



const createOptions = (options: IOptionsRoute = {
  readOnly: true, 
  dbSettings: 'Orm',
  authentication: true,
}) => (target: any, propertyKey: string): void => {
  const newProperty = setProperty(target, propertyKey);
  // ReadOnly
  newProperty(options.readOnly, 'readonly');
  // DbSettings
  newProperty(options.dbSettings, 'dbsettings');
  // Authentication
  newProperty(options.authentication, 'authentication');
};

const setRoute = (path: string = '', method: Method, options?: IOptionsRoute) => (target: any, propertyKey: string) => {
  if (!Reflect.hasMetadata('routes', target.constructor)) {
    Reflect.defineMetadata('routes', [], target.constructor);
  }
  const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

  routes.push({
    requestMethod: method,
    path: path === '' ? '/' + propertyKey : path,
    methodName: propertyKey
  });
  Reflect.defineMetadata('routes', routes, target.constructor);
  createOptions(options)(target, propertyKey);
}

const Get    = (path?:string, options?: IOptionsRoute) =>  setRoute(path, Method.get, options);
const Post   = (path?:string, options?: IOptionsRoute) =>  setRoute(path, Method.post, options);
const Put    = (path?:string, options?: IOptionsRoute) =>  setRoute(path, Method.put, options);
const Patch  = (path?:string, options?: IOptionsRoute) =>  setRoute(path, Method.patch, options);
const Delete = (path?:string, options?: IOptionsRoute) =>  setRoute(path, Method.delete, options);


const Route = (controllerPath = ''): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata('controller_path', controllerPath, target);

    // Since routes are set by our methods this should almost never be true (except the controller has no methods)
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
  };
};

const Model = (model: string): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata('model', model, target);
  };
};

const StoredProcedure = (storedProcedure: string): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata('storedprocedure', storedProcedure, target);
  };
};

const Authentication = (authentication = true) =>
  (target: any, propertyKey: string) => setProperty(target, propertyKey)(authentication, 'authentication');

const ReadOnly = (ronly = true) =>
  (target: any, propertyKey: string) => setProperty(target, propertyKey)(ronly, 'readonly');

const DbSettings = (modelType: 'Procedure' | 'Orm' | 'Query') =>
  (target: any, propertyKey: string) => setProperty(target, propertyKey)(modelType, 'dbsettings');

const Permission = (permission = true) =>
  (target: any, propertyKey: string) => setProperty(target, propertyKey)(permission, 'permission');

const Log = (log = true, config: Record<string, unknown> = {}) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('log', target.constructor)) {
      Reflect.defineMetadata('log', [], target.constructor);
    }
    if (!Reflect.hasMetadata('logConfig', target.constructor)) {
      Reflect.defineMetadata('logConfig', [], target.constructor);
    }
    const logVar = Reflect.getMetadata('log', target.constructor) as {
      [id: string]: boolean;
    };
    logVar[propertyKey] = log;
    const logConfig = Reflect.getMetadata('logConfig', target.constructor) as {
      [id: string]: Record<string, unknown>;
    };
    logConfig[propertyKey] = config;
    Reflect.defineMetadata('log', logVar, target.constructor);
    Reflect.defineMetadata('logConfig', logConfig, target.constructor);
  };
};

export {
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Route,
  Authentication,
  Log,
  Permission,
  DbSettings,
  ReadOnly,
  Model,
  StoredProcedure
};