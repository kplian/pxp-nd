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
import http from 'http';
import socketIO from 'socket.io';
/** swagger options **/
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerOptions from './swaggerOptions';
import { ControllerInterface as Controller } from './lib/pxp';
import loadControllers from './lib/pxp/loadControllers';
import { errorMiddleware } from './lib/pxp';
// import { getAuthRoutes, customAuthRoutes } from '@pxp-nd/auth';
// import { configPassport } from '@pxp-nd/auth';
// import { Session } from '@pxp-nd/entities';
import { TypeormStore } from 'typeorm-store';
import { getReportsRouter } from './lib/reports/report-routes';
import { IConfigPxpApp } from './interfaces';
import PxpIOServer from './sockets/pxp-io-server';

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
  private configAuth: any = null;
  public Report: any = null;
  public ReportGroup: any = null;
  private _httpServer: http.Server;
  public io: socketIO.Server;
  private static _instance: PxpApp;
  public sockets: any = {};

  config: IConfigPxpApp = {
    defaultDbSettings: 'Orm', // Orm, Procedure, Query
    apiPrefix: '/api',
    logDuration: true,
    middlewares: [],
  };

  constructor(config: IConfigPxpApp) {
    this.folderModulesCreate();
    this.config = {...this.config, ...config};
    this.app = express();
    this.controllers = [];
    // this.initializeMiddlewares();
  }

  public static get instance() {
    return this._instance || ( this._instance = new this(null) );
  }

  set ConfigAuth(authOptions:any) {
    this.configAuth = authOptions;
  }

  private initializeSwagger() {
    const options = {
      customCss: '.swagger-ui .topbar { display: none }',
      explorer: true,
    };
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    this.app.use('/explorer', swaggerUi.serve, swaggerUi.setup(
      swaggerDocs, 
      options,
    ));
  }

  public async loadControllers(): Promise<void> {
    // await this.connectToTheDatabase();
    // await this.initializeAuthentication();
    this.controllers = await loadControllers(this.config, this.io);
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private loadIOserver(){
    this._httpServer = new http.Server( this.app );
    if(this.config.enableSocket) {
      this.io = new PxpIOServer(this._httpServer, this.sockets).io;
    }
  }
  public listen(): void {
    this._httpServer.listen(process.env.PORT, () => {
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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(fileUpload({
      limits: { fileSize: 5 * 1024 * 1024 },
    }));
    this.configCors();
  }

  public async initializeAuthentication(configAuth: any) {
    if(configAuth) {
      const { configPassport, getAuthRoutes, customAuthRoutes } = configAuth();
      this.initializeSession();
      await this.initializePassport(configPassport, getAuthRoutes, customAuthRoutes);
    } else {
      throw new Error(`Invalid config Auth, set ConfigAuth:\n
        \t// App.ts file
        \timport { configAuth } from '@pxp-nd/auth';
        \t// In constructror set...
        \tthis.ConfigAuth  = configAuth;
        \t//...`);
    }
  }

  initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private async initializePassport(configPassport: any, getAuthRoutes: any, customAuthRoutes: any ) {
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
     
    const authRoutes: any = getAuthRoutes(this.config.apiPrefix);
    this.showRoutes(authRoutes);
    this.app.use(authRoutes);
    if(this.config.reports) {
      if(!this.Report && !this.ReportGroup) {
        throw new Error(`Invalid Report configuration, set Report and ReportGroup entities:\n
          \t// App.ts file
          \timport { Report, ReportGroup } from '@pxp-nd/common';
          \t//...
          \tthis.Report  = Report;
          \tthis.ReportGroup  = ReportGroup;
          `)
      }
      const reportRouter = getReportsRouter(this.config, this.Report, this.ReportGroup);
      this.showRoutes(reportRouter);
      this.app.use(reportRouter);
    }
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
      this.showRoutes(controller.router);
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

    // Show routes with config.showRoutes is true
  private showRoutes(router: any): void {
    const routes = router.stack.filter((r: any) => r.route)
    .map((r: any) => {
      return {
        method: Object.keys(r.route.methods)[0].toUpperCase(),
        path: r.route.path
      };
    });
    
    if(this.config.showRoutes) {
      routes.forEach((route: any) => 
      console.log(`${'\x1b[31m'}${route.method.toUpperCase()}:\t${'\x1b[32m'}${route.path}${'\x1b[0m'}`));
      console.log('');
    }
  }

  async connectDatabase(): Promise<void> {
    await createConnections();
  }

  async run(): Promise<void> {
    this.initializeSwagger();
    this.initializeMiddlewares();
    await this.connectDatabase();
    // configure auth options
    if(this.config.auth) {
      await this.initializeAuthentication(this.configAuth);
    }
    // load ioServer 
    this.loadIOserver();
    // load controllers and routes
    await this.loadControllers();
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
