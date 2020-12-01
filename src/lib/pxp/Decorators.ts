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
import { RouteDefinition } from './RouteDefinition';

const Get = (path = '') => {
  return (target: any, propertyKey: string): void => {

    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

    routes.push({
      requestMethod: 'get',
      path: path === '' ? '/' + propertyKey : path,
      methodName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

const Post = (path = '') => {
  return (target: any, propertyKey: string): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

    routes.push({
      requestMethod: 'post',
      path: path === '' ? '/' + propertyKey : path,
      methodName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

const Put = (path = '') => {
  return (target: any, propertyKey: string): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

    routes.push({
      requestMethod: 'put',
      path: path === '' ? '/' + propertyKey : path,
      methodName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

const Delete = (path = '') => {
  return (target: any, propertyKey: string): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

    routes.push({
      requestMethod: 'delete',
      path: path === '' ? '/' + propertyKey : path,
      methodName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

const Patch = (path = '') => {
  return (target: any, propertyKey: string): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];

    routes.push({
      requestMethod: 'patch',
      path: path === '' ? '/' + propertyKey : path,
      methodName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

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

const Authentication = (authentication = true) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('authentication', target.constructor)) {
      Reflect.defineMetadata('authentication', {}, target.constructor);
    }
    const aut = Reflect.getMetadata('authentication', target.constructor) as {
      [id: string]: boolean;
    };
    aut[propertyKey] = authentication;

    Reflect.defineMetadata('authentication', aut, target.constructor);
  };
};

const Log = (log = true) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('log', target.constructor)) {
      Reflect.defineMetadata('log', [], target.constructor);
    }
    const logVar = Reflect.getMetadata('log', target.constructor) as {
      [id: string]: boolean;
    };
    logVar[propertyKey] = log;
    Reflect.defineMetadata('log', logVar, target.constructor);
  };
};

const Permission = (permission = true) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('permission', target.constructor)) {
      Reflect.defineMetadata('permission', [], target.constructor);
    }
    const perVar = Reflect.getMetadata('permission', target.constructor) as {
      [id: string]: boolean;
    };
    perVar[propertyKey] = permission;
    Reflect.defineMetadata('permission', perVar, target.constructor);
  };
};

const ReadOnly = (ronly = true) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('readonly', target.constructor)) {
      Reflect.defineMetadata('readonly', [], target.constructor);
    }
    const rOnlyVar = Reflect.getMetadata('readonly', target.constructor) as {
      [id: string]: boolean;
    };
    rOnlyVar[propertyKey] = ronly;
    Reflect.defineMetadata('readonly', rOnlyVar, target.constructor);
  };
};

const DbSettings = (modelType: 'Procedure' | 'Orm' | 'Query') => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('dbsettings', target.constructor)) {
      Reflect.defineMetadata('dbsettings', [], target.constructor);
    }
    const dbvar = Reflect.getMetadata('dbsettings', target.constructor) as {
      [id: string]: 'Procedure' | 'Orm' | 'Query';
    };
    dbvar[propertyKey] = modelType;

    Reflect.defineMetadata('dbsettings', dbvar, target.constructor);
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