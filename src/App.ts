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
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { getConnection } from 'typeorm';
import cors from 'cors';
import { ControllerInterface as Controller } from './lib/pxp';
import loadControllers from './lib/pxp/loadControllers';
import { errorMiddleware } from './lib/pxp';
import { authRouter } from './auth/auth-routes';
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
    this.initializeAuthentication();
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
    this.configCors();
  }

  initializeAuthentication(): void {
    this.initializeSession();
    this.initializePassport();
  }

  initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private initializePassport() {
    configPassport();
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    this.app.use((req, res, next) => {
      next();
    });
    this.app.use(authRouter);
    this.app.use(reportsRouter);
  }

  private configCors() {
    const whitelist = ['http://localhost:3100'];

    // const corsOptions = {
    //   origin: function (origin, callback) {
    //     if (whitelist.indexOf(origin) !== -1 || !origin) {
    //       callback(null, true);
    //     } else {
    //       callback(new Error('Not allowed by CORS'));
    //     }
    //   }
    // };
    this.app.use(cors({ credentials: true, origin: process.env.HOST_FRONT }));
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
          maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
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
