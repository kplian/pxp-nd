/**
 * Controller Class.
 *
 * All common controllers functionality should go here (all controllers should inherit this class).
 *
 * @link   src/lib/ControlMiddle.js
 * @file   BaseController Class.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */

import Joi from '@hapi/joi';
import { Router, Request, Response, NextFunction } from 'express';
import { __ } from './PxpError';
import { RouteDefinition } from './RouteDefinition';
import { PxpError } from './PxpError';
import ControllerInterface from './ControllerInterface';
import config from '../config';

import { isAuthenticated } from '../auth/config/passport-local';

class Controller implements ControllerInterface {
  public schemaValidated: boolean;
  public params: Record<string, unknown>[];
  public router = Router();
  public path = '';
  public module = '';
  public model = '';

  constructor(module: string) {
    this.schemaValidated = false;
    this.module = module;
    if (Reflect.hasMetadata('model', this.constructor)) {
      this.model = Reflect.getMetadata('model', this.constructor);
      const modelArray = this.model.split('/');
      try {
        const defaultModel = import(`../modules/${modelArray[0]}/entity/${modelArray[1]}`);
      } catch {
        throw new PxpError(500, 'Model defined in  ' + this.constructor.name + ' not found.');
      }
    }
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const routes = Reflect.getMetadata('routes', this.constructor) as Array<
      RouteDefinition
    >;
    this.path = '/' + this.constructor.name;
    //get controller path
    if (Reflect.hasMetadata('controller_path', this.constructor)) {
      this.path = Reflect.getMetadata('controller_path', this.constructor);
    }
    //get read only
    const readonly = Reflect.getMetadata('readonly', this.constructor) as { [id: string]: boolean; } || {};
    //get authentication
    const authentication = Reflect.getMetadata('authentication', this.constructor) as { [id: string]: boolean; } || {};
    //get permission
    const permission = Reflect.getMetadata('permission', this.constructor) as { [id: string]: boolean; } || {};
    //get log
    const log = Reflect.getMetadata('permission', this.constructor) as { [id: string]: boolean; } || {};
    //get dbsettings
    const dbsettings = Reflect.getMetadata('dbsettings', this.constructor) as { [id: string]: 'Procedure' | 'Orm' | 'Query'; } || {};

    routes.forEach(route => {
      const methodDbSettings = dbsettings[route.methodName] || config.defaultDbSettings;
      if (!(route.methodName in readonly)) {
        throw new PxpError(500, 'ReadOnly decorator was not defined for ' + route.methodName + ' in ' + this.constructor.name + ' controller.');
      }
      if (route.methodName in authentication && authentication[route.methodName] === false) {
        this.router[route.requestMethod]('/' + this.module + this.path + route.path, async (req: Request, res: Response, next: NextFunction) => {
          // Execute our method for this path and pass our express request and response object.
          const params = { ...req.query, ...req.body, ...req.params };
          await this.genericMethodWrapper(params, next, res, route.methodName, methodDbSettings, readonly[route.methodName], permission[route.methodName], log[route.methodName]);
        });
      } else {
        //call with middleware
        this.router[route.requestMethod]('/' + this.module + this.path + route.path,
          //MIDDLEWARES AREA
          isAuthenticated,
          async (req: Request, res: Response, next: NextFunction) => {
            // Execute our method for this path and pass our express request and response object.
            const params = { ...req.query, ...req.body, ...req.params };
            await this.genericMethodWrapper(params, next, res, route.methodName, methodDbSettings, readonly[route.methodName], permission[route.methodName], log[route.methodName]);
          });
      }

    });
  }

  async genericMethodWrapper(params: Record<string, unknown>, next: NextFunction, res: Response, methodName: string, dbsettings: string, readonly: boolean, permission = true, log = true): Promise<void> {
    if (dbsettings === 'Orm') {
      await this.ormMethodWrapper(params, next, res, methodName, readonly, permission, log);
    } else if (dbsettings === 'Procedure') {
      await this.procedureMethodWrapper(params, next, res, methodName, readonly, permission, log);
    } else {
      await this.sqlMethodWrapper(params, next, res, methodName, readonly, permission, log);
    }
  }

  async ormMethodWrapper(params: Record<string, unknown>, next: NextFunction, res: Response, methodName: string, readonly: boolean, permission = true, log = true): Promise<void> {

    try {
      let metResponse = {};
      if (permission) {
        console.log('validate permission');
      }
      if (permission) {
        console.log('get readonly connection');
      }
      metResponse = await eval(`this.${methodName}(params)`);
      if (permission) {
        console.log('insert into log');
      }
      res.json(metResponse);
    } catch (ex) {
      next(ex);
    }


  }

  async procedureMethodWrapper(params: Record<string, unknown>, next: NextFunction, res: Response, methodName: string, readonly: boolean, permission = true, log = true): Promise<void> {
    console.log('before function');
    await eval(`this.${methodName}(req, res)`);
    console.log('after function');
  }

  async sqlMethodWrapper(params: Record<string, unknown>, next: NextFunction, res: Response, methodName: string, readonly: boolean, permission = true, log = true): Promise<void> {
    console.log('before function');
    await eval(`this.${methodName}(req, res)`);
    console.log('after function');
  }


  async validateSchema(schema: Joi.Schema): Promise<unknown> {
    const value = await __(
      schema.validateAsync(this.params, { abortEarly: false }),
      true
    );
    this.schemaValidated = true;
    return value;
  }
}

/*************************DECORATORS***********************************/


const Get = (path = '') => {
  return (target: any, propertyKey: string): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }
    // console.log('get', target);
    // console.log('get', target.constructor);

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<
      RouteDefinition
    >;

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
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<
      RouteDefinition
    >;

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
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;

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
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;

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
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;

    routes.push({
      requestMethod: 'patch',
      path: path === '' ? '/' + propertyKey : path,
      methodName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};

const Route = (controller_path = ''): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata('controller_path', controller_path, target);

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
    const aut = Reflect.getMetadata('authentication', target.constructor) as { [id: string]: boolean; };
    aut[propertyKey] = authentication;

    Reflect.defineMetadata('authentication', aut, target.constructor);
  };
};

const Log = (log = true) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('log', target.constructor)) {
      Reflect.defineMetadata('log', [], target.constructor);
    }
    const logVar = Reflect.getMetadata('log', target.constructor) as { [id: string]: boolean; };
    logVar[propertyKey] = log;
    Reflect.defineMetadata('log', logVar, target.constructor);
  };
};

const Permission = (permission = true) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('permission', target.constructor)) {
      Reflect.defineMetadata('permission', [], target.constructor);
    }
    const perVar = Reflect.getMetadata('permission', target.constructor) as { [id: string]: boolean; };
    perVar[propertyKey] = permission;
    Reflect.defineMetadata('permission', perVar, target.constructor);
  };
};

const ReadOnly = (ronly = true) => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('readonly', target.constructor)) {
      Reflect.defineMetadata('readonly', [], target.constructor);
    }
    const rOnlyVar = Reflect.getMetadata('readonly', target.constructor) as { [id: string]: boolean; };
    rOnlyVar[propertyKey] = ronly;
    Reflect.defineMetadata('readonly', rOnlyVar, target.constructor);
  };
};

const DbSettings = (modelType: 'Procedure' | 'Orm' | 'Query') => {
  return (target: any, propertyKey: string): void => {
    if (!Reflect.hasMetadata('dbsettings', target.constructor)) {
      Reflect.defineMetadata('dbsettings', [], target.constructor);
    }
    const dbvar = Reflect.getMetadata('readonly', target.constructor) as { [id: string]: 'Procedure' | 'Orm' | 'Query'; };
    dbvar[propertyKey] = modelType;

    Reflect.defineMetadata('dbsettings', dbvar, target.constructor);
  };
};



export default Controller;
export { Get, Post, Put, Delete, Patch, Route, Authentication, Log, Permission, DbSettings, ReadOnly, Model, StoredProcedure };
