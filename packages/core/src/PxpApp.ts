/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Main pxp-nd file.
 *
 * @summary Handles all requests for pxp-ui or pxp-nd.
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-20 18:24:45
 */

import 'reflect-metadata';
import { createConnections } from 'typeorm';
import * as bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { getConnection } from 'typeorm';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { ControllerInterface as Controller } from './lib/pxp';
import loadControllers from './lib/pxp/loadControllers';
import { errorMiddleware } from './lib/pxp';
import { getAuthRoutes, customAuthRoutes } from '@pxp-nd/auth';
import { configPassport } from '@pxp-nd/auth';
// import { Session } from '@pxp-nd/entities';
import { TypeormStore } from 'typeorm-store';
import { getReportsRouter } from './lib/reports/report-routes';
import { IConfigPxpApp } from './interfaces';

const modulesPxp = {
  auth: '@pxp-nd/auth',
  common: '@pxp-nd/common',
  reports: '@pxp-nd/reports',
}
//auth configure 
/**
 * 
 * */
class PxpApp {
  public app: express.Application;
  public controllers: Controller[];
  config: IConfigPxpApp = {
    defaultDbSettings: 'Orm', // Orm, Procedure, Query
    apiPrefix: '/api',
    logDuration: true
  };

  constructor(config: IConfigPxpApp) {
    this.folderModulesCreate();
    this.config = {...this.config, ...config};
    this.app = express();
    this.controllers = [];
    // this.initializeMiddlewares();
  }
  public async loadControllers(controllers: any): Promise<void> {
    this.controllers = await loadControllers(controllers, this.config);
    await this.connectToTheDatabase();
    await this.initializeAuthentication();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }
  public listen(): void {
    this.app.listen(process.env.PORT, () => {
      console.log(`${'\x1b[36m'}App listening on the port ${process.env.PORT}${'\x1b[0m'}`);
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  private getDurationInMilliseconds = (start: [number, number]) => {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };

  public initializeMiddlewares() {
    this.app.use((req: any, res, next) => {
      req.start = new Date();
      if (this.config.logDuration) {
        console.log(`${req.method} ${req.originalUrl} [STARTED]`);
        const start = process.hrtime();

        res.on('finish', () => {
          const durationInMilliseconds = this.getDurationInMilliseconds(start);
          console.log(
            `${req.method} ${
              req.originalUrl
            } [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`
          );
        });

        res.on('close', () => {
          const durationInMilliseconds = this.getDurationInMilliseconds(start);
          console.log(
            `${req.method} ${
              req.originalUrl
            } [CLOSED] ${durationInMilliseconds.toLocaleString()} ms`
          );
        });
      }

      next();
    });
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(fileUpload({
      limits: { fileSize: 5 * 1024 * 1024 },
    }));
    this.configCors();
  }

  async initializeAuthentication() {
    this.initializeSession();
    await this.initializePassport();
  }

  initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private async initializePassport() {
    configPassport(this.config.auth);
    this.app.use(passport.initialize());
    // @todo only validate session if authorization is not set(10/03/2021)
    this.app.use(passport.session());


    this.app.use((req, res, next) => {
      if (req.headers.authorization) {
        passport.authenticate('jwt',  { session: false }, function(err, user, info) {
          if (user) {
            req.logIn(user, function(err) {
              next();
            });
          } else {
            next();
          }
        })(req, res, next);
      } else {
        next();
      }
    });

    this.app.use((req, res, next) => {
      next();
    });

    const routes: any = await customAuthRoutes();
    routes.forEach((route:any) => this.app.use(route.router));

    this.app.use(getAuthRoutes(this.config.apiPrefix));
    this.app.use(getReportsRouter(this.config));

  }

  private configCors() {
    const whitelist = process.env.WHITE_LIST ? String(process.env.WHITE_LIST).split(',') :[];

    const corsOptions = {
      credentials: true,
      origin: function (origin: any, callback: any) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    };
    this.app.use(cors(corsOptions));
    this.app.options('*', cors());
  }
  private initializeSession() {
    const repository: any = getConnection().getRepository(this.config.session);
    this.app.use(
      session({
        secret: String(process.env.SECRET),
        resave: false,
        saveUninitialized: true,
        store: new TypeormStore({ repository }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 168
          // 24 = 1 day  <=> 168 = 7 days
          // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
        }
      })
    );
  }

  private initializeRoutes() {
    this.controllers.forEach((controller) => {
      this.app.use(controller.router);
    });
    this.app.all('*', function (req, res) {
      res.status(404).json({
        error: {
          code: 404,
          message: 'Route not found'
        }
      });
    });
  }

  private async connectToTheDatabase(): Promise<void> {
    await createConnections();
  }

  private folderModulesCreate () {
    const dirModules = path.join(process.cwd(), 'dist/modules');
    const dirModulesSrc = path.join(process.cwd(), 'src/modules');
    if(!fs.existsSync(dirModules)) {
      fs.mkdirSync(dirModules, '0744');
    }

    if(!fs.existsSync(dirModulesSrc)) {
      fs.mkdirSync(dirModulesSrc, '0744');
    }
  }
}

export {PxpApp};
