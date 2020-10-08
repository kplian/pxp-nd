/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Controller Class.
 *
 * @summary All common controllers functionality go here (all controllers should inherit this class).
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-30 11:33:30
 */
import { Like, getConnection, EntityManager } from 'typeorm';
import { validate } from 'class-validator';
import _ from 'lodash';
import { Router, Request, Response, NextFunction } from 'express';
import Joi, { Schema } from '@hapi/joi';
import { RouteDefinition } from './RouteDefinition';
import {
  PxpError,
  __,
  errorMiddleware,
  ControllerInterface,
  ListParam,
  userHasPermission,
  insertLog
} from './index';
import config from '../../config';
import User from '../../modules/pxp/entity/User';
import { isAuthenticated } from '../../auth/config/passport-local';
import { parseParams } from './ParseParams';

class Controller implements ControllerInterface {
  public validated: boolean;
  public params: Record<string, unknown>[];
  public router = Router();
  public path = '';
  public module = '';
  public modelString = '';
  public transactionCode = '';
  public user: User;
  public model: any;
  private basicRoutes: RouteDefinition[] = [
    { requestMethod: 'post', path: '/add', methodName: 'add' },
    { requestMethod: 'delete', path: '/delete/:id', methodName: 'delete' },
    { requestMethod: 'patch', path: '/edit/:id', methodName: 'edit' },
    { requestMethod: 'get', path: '/list', methodName: 'list' }
  ];
  private basicReadOnly = {
    add: false,
    edit: false,
    list: true,
    delete: false
  };

  constructor(module: string) {
    this.validated = false;
    this.module = module;

    if (Reflect.hasMetadata('model', this.constructor)) {
      this.modelString = Reflect.getMetadata('model', this.constructor);
      const modelArray = this.modelString.split('/');
      try {
        import(`../../modules/${modelArray[0]}/entity/${modelArray[1]}`).then(
          (model) => {
            this.model = model.default;
          }
        );
      } catch {
        throw new PxpError(
          500,
          'Model defined in  ' + this.constructor.name + ' not found.'
        );
      }
    }
    this.initializeRoutes();
  }

  private initializeRoutes() {
    let routes = Reflect.getMetadata(
      'routes',
      this.constructor
    ) as RouteDefinition[];
    this.path = '/' + this.constructor.name;
    // get controller path
    if (Reflect.hasMetadata('controller_path', this.constructor)) {
      this.path = Reflect.getMetadata('controller_path', this.constructor);
    }
    // get read only
    let readonly =
      (Reflect.getMetadata('readonly', this.constructor) as {
        [id: string]: boolean;
      }) || {};
    // get authentication
    const authentication =
      (Reflect.getMetadata('authentication', this.constructor) as {
        [id: string]: boolean;
      }) || {};
    // get permission
    const permission =
      (Reflect.getMetadata('permission', this.constructor) as {
        [id: string]: boolean;
      }) || {};
    // get log
    const log =
      (Reflect.getMetadata('log', this.constructor) as {
        [id: string]: boolean;
      }) || {};
    // get dbsettings
    const dbsettings =
      (Reflect.getMetadata('dbsettings', this.constructor) as {
        [id: string]: 'Procedure' | 'Orm' | 'Query';
      }) || {};

    // define basic routes
    if (this.modelString !== '') {
      routes = _.union(this.basicRoutes, routes);
      readonly = { ...this.basicReadOnly, ...readonly };
    }

    routes.forEach((route) => {
      const methodDbSettings =
        dbsettings[route.methodName] || config.defaultDbSettings;
      if (!(route.methodName in readonly)) {
        throw new PxpError(
          500,
          'ReadOnly decorator was not defined for ' +
          route.methodName +
          ' in ' +
          this.constructor.name +
          ' controller.'
        );
      }
      if (
        route.methodName in authentication &&
        authentication[route.methodName] === false
      ) {
        this.router[route.requestMethod](
          config.apiPrefix + '/' + this.module + this.path + route.path,
          async (req: Request, res: Response, next: NextFunction) => {
            // Execute our method for this path and pass our express request and response object.
            const params = { ...req.query, ...req.body, ...req.params };
            this.transactionCode = (this.module + this.path + route.path)
              .split('/')
              .join('.')
              .toLowerCase();
            this.validated = false;
            try {
              await __(
                this.genericMethodWrapper(
                  params,
                  req,
                  next,
                  res,
                  route.methodName,
                  methodDbSettings,
                  readonly[route.methodName],
                  false,
                  log[route.methodName]
                )
              );
            } catch (ex) {
              const now = new Date();
              const iniAt = req.start as Date;
              const endsAt = now.valueOf() - iniAt.valueOf();

              res.logId = await __(insertLog(
                'nouser',
                'mac',
                req.ip,
                'error',
                ex.tecMessage,
                this.module,
                this.transactionCode,
                '',// query
                JSON.stringify(params),
                ex.stack,
                ex.statusCode,
                endsAt)) as number;

              errorMiddleware(ex, req, res);
            }
          }
        );
      } else {
        this.router[route.requestMethod](
          config.apiPrefix + '/' + this.module + this.path + route.path,
          // MIDDLEWARES AREA
          [parseParams, isAuthenticated],
          async (req: any, res: Response, next: NextFunction) => {
            // Execute our method for this path and pass our express request and response object.
            // const params = { ...req.query, ...req.body, ...req.params };
            const params = req.pxpParams;
            console.log('pxpp', params);
            
            if (req.user) {
              this.user = req.user as User;
            }
            this.transactionCode = (this.module + this.path + route.path)
              .split('/')
              .join('.')
              .toLowerCase();

            this.validated = false;
            try {
              await __(
                this.genericMethodWrapper(
                  params,
                  req,
                  next,
                  res,
                  route.methodName,
                  methodDbSettings,
                  readonly[route.methodName],
                  permission[route.methodName],
                  log[route.methodName]
                )
              );
            } catch (ex) {
              const now = new Date();
              const iniAt = req.start as Date;
              const endsAt = now.valueOf() - iniAt.valueOf();
              res.logId = (await __(
                insertLog(
                  this.user.username,
                  'mac',
                  req.ip,
                  'error',
                  ex.tecMessage,
                  this.module,
                  this.transactionCode,
                  '', // query
                  JSON.stringify(params),
                  ex.stack,
                  ex.statusCode,
                  endsAt
                )
              )) as number;
              errorMiddleware(ex, req, res);
            }
          }
        );
      }
    });
  }

  async genericMethodWrapper(
    params: Record<string, unknown>,
    req: Request,
    next: NextFunction,
    res: Response,
    methodName: string,
    dbsettings: string,
    readonly: boolean,
    permission = true,
    log = true
  ): Promise<void> {
    if (dbsettings === 'Orm') {
      await __(
        this.ormMethodWrapper(
          params,
          req,
          next,
          res,
          methodName,
          readonly,
          permission,
          log
        )
      );
    } else if (dbsettings === 'Procedure') {
      await __(
        this.procedureMethodWrapper(
          params,
          next,
          res,
          methodName,
          readonly,
          permission,
          log
        )
      );
    } else {
      await this.sqlMethodWrapper(
        params,
        next,
        res,
        methodName,
        readonly,
        permission,
        log
      );
    }
  }

  async ormMethodWrapper(
    params: Record<string, unknown>,
    req: Request,
    next: NextFunction,
    res: Response,
    methodName: string,
    readonly: boolean,
    permission = true,
    log = true
  ): Promise<void> {
    let metResponse: unknown;
    if (permission) {
      if (this.user && this.user.roles && this.user.roles.length === 0) {
        const hasPermission = await __(
          userHasPermission(this.user.userId as number, this.transactionCode)
        );
        if (!hasPermission) {
          throw new PxpError(403, 'Access denied to execute this method');
        }
      }
    }
    if (readonly) {
      metResponse = await __(eval(`this.${methodName}(params)`));

    } else {
      const connection = getConnection(process.env.DB_WRITE_CONNECTION_NAME);
      const queryRunner = connection.createQueryRunner();

      // establish real database connection using our new query runner
      await __(queryRunner.connect());
      await __(queryRunner.startTransaction());
      try {
        metResponse = (await eval(
          `this.${methodName}(params, queryRunner.manager)`
        )) as Record<string, unknown>;
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await __(queryRunner.release());
      }
    }

    if (log) {
      const now = new Date();
      const iniAt = req.start as Date;
      const endsAt = now.valueOf() - iniAt.valueOf();
      __(
        insertLog(
          this.user.username,
          'mac',
          req.ip,
          'success',
          'successful transaction',
          this.module,
          this.transactionCode,
          '',
          JSON.stringify(params),
          JSON.stringify(metResponse),
          '200',
          endsAt
        )
      );
    }
    res.json(metResponse);
  }

  async list(params: Record<string, unknown>): Promise<unknown> {
    const schema = this.getListSchema();
    const resParams = await __(this.schemaValidate(schema, params));
    const listParam = this.getListParams(resParams);
    const [rows, count] = await __(this.model.findAndCount(listParam)) as unknown[];
    return { data: rows, count };
  }

  async add(
    params: Record<string, unknown>,
    manager: EntityManager
  ): Promise<unknown> {
    const modelInstance = new this.model();
    Object.assign(modelInstance, params);
    modelInstance.createdBy = this.user.username as string;
    await __(this.classValidate(modelInstance));
    await manager.save(modelInstance);
    return modelInstance;
  }

  async edit(
    params: Record<string, unknown>,
    manager: EntityManager
  ): Promise<unknown> {
    const modelInstance = (await __(this.model.findOne(params.id))) as any;
    if (!modelInstance) {
      throw new PxpError(406, 'Record not found');
    }
    const editParams = params;
    Object.assign(modelInstance, editParams);
    delete editParams.id;
    modelInstance.modifiedBy = this.user.username as string;
    await __(this.classValidate(modelInstance));
    await manager.save(modelInstance);
    return modelInstance;
  }

  async delete(
    params: Record<string, unknown>,
    manager: EntityManager
  ): Promise<unknown> {
    const modelInstance = (await __(this.model.findOne(params.id))) as any;
    if (!modelInstance) {
      throw new PxpError(406, 'Record not found');
    }
    await manager.remove(modelInstance);
    return modelInstance;
  }

  getListParams(params: Record<string, unknown>): ListParam {
    const res: ListParam = {
      where: [],
      skip: params.start as number,
      take: params.limit as number,
      order: {
        [params.sort as string]: params.dir as string
      }
    };
    if (params.genericFilterFields) {
      const genericFilterFields = params.genericFilterFields as string;
      const filterFieldsArray = genericFilterFields.split('#');
      filterFieldsArray.forEach((field) => {
        if (res.where) {
          res.where.push({
            [field]: Like('%' + (params.genericFilterValue as string) + '%')
          });
        }
      });
    }
    return res;
  }

  async procedureMethodWrapper(
    params: Record<string, unknown>,
    next: NextFunction,
    res: Response,
    methodName: string,
    readonly: boolean,
    permission = true,
    log = true
  ): Promise<void> {
    console.log('before function');
    await eval(`this.${methodName}(req, res)`);
    console.log('after function');
  }

  async sqlMethodWrapper(
    params: Record<string, unknown>,
    next: NextFunction,
    res: Response,
    methodName: string,
    readonly: boolean,
    permission = true,
    log = true
  ): Promise<void> {
    console.log('before function');
    await eval(`this.${methodName}(req, res)`);
    console.log('after function');
  }

  async classValidate(model: any): Promise<void> {
    const errors = await __(validate(model)) as unknown[];
    this.validated = true;
    if (errors.length > 0) {
      throw new PxpError(
        406,
        'Validation failed!',
        (errors as unknown) as undefined
      );
    }
  }

  async schemaValidate(schema: Schema, params: Record<string, unknown>): Promise<unknown> {
    const value = await __(schema.validateAsync(params, { abortEarly: false }), true) as boolean;
    this.validated = true;
    return value;
  }

  getListSchema(): Schema {
    const schema = Joi.object({
      start: Joi.number().integer().required(),
      limit: Joi.number().integer().positive().required(),
      sort: Joi.string().min(2).required(),
      dir: Joi.string().min(3).max(4).required(),
      genericFilterFields: Joi.string().min(2),
      genericFilterValue: Joi.string().min(1),
    });
    return schema;
  }
}

export { Controller };
