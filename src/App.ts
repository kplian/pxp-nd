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
import { ControllerInterface as Controller } from './lib/pxp';
import loadControllers from './lib/pxp/loadControllers';
import { errorMiddleware } from './lib/pxp';
import { authRouter, customAuthRoutes } from './auth/auth-routes';
import { configPassport } from './auth/config';
import { Session } from './modules/pxp/entity/Session';
import { TypeormStore } from 'typeorm-store';
import config from './config';
import { reportsRouter } from './lib/reports/report-routes';
class App {
  public app: express.Application;
  public controllers: Controller[];

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.controllers = [];
  }
  public async loadControllers(): Promise<void> {
    this.controllers = await loadControllers();
    await this.connectToTheDatabase();
    await this.initializeAuthentication();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }
  public listen(): void {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
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

  private initializeMiddlewares() {
    this.app.use((req, res, next) => {
      req.start = new Date();
      if (config.logDuration) {
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
    configPassport();
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

    this.app.use(authRouter);
    this.app.use(reportsRouter);

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
    const repository = getConnection().getRepository(Session);
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
}

export default App;
