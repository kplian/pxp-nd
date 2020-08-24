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
import { Router, Request, Response } from 'express';
import { __ } from './PxpError';
import { RouteDefinition } from './RouteDefinition';
import ControllerInterface from './ControllerInterface';


class Controller implements ControllerInterface {
  public schemaValidated: boolean;
  public params: Record<string, unknown>[];
  public router = Router();
  public path = '';
  public module = '';

  constructor(module: string) {
    this.schemaValidated = false;
    this.module = module;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const routes = Reflect.getMetadata('routes', this.constructor) as Array<RouteDefinition>;
    this.path = '/' + this.constructor.name;
    if (Reflect.hasMetadata('controller_path', this.constructor)) {
      this.path = Reflect.getMetadata('controller_path', this.constructor);
    }
    routes.forEach(route => {

      this.router[route.requestMethod]('/' + this.module + this.path + route.path, async (req: Request, res: Response) => {
        // Execute our method for this path and pass our express request and response object.
        await this.methodWrapper(req, res, route.methodName);

      });
    });
  }

  async methodWrapper(req: Request, res: Response, methodName: string): Promise<void> {
    console.log('before function');
    await eval(`this.${methodName}(req, res)`);
    console.log('after function');
  }

  setParams(params: Record<string, unknown>[]): void {
    this.params = params;
  }
  async validateSchema(schema: Joi.Schema): Promise<unknown> {
    const value = await __(schema.validateAsync(this.params, { abortEarly: false }), true);
    this.schemaValidated = true;
    return value;
  }
}




const Get = (path = '') => {
  return (target: any, propertyKey: string): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }
    console.log('get', target);
    console.log('get', target.constructor);

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;

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
    const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;

    routes.push({
      requestMethod: 'post',
      path: path === '' ? propertyKey : path,
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

export default Controller;
export { Get, Post, Route };