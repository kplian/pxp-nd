/**
 * Index file for pxp-nd.
 *
 * Handles all requests for pxp-ui or pxp-nd.
 *
 * @link   index.js
 * @file   index script.
 * @author Jaime Rivera (Kplian).
 * @since  10.06.2020
 */

import 'reflect-metadata';
import { createConnections } from 'typeorm';
import * as bodyParser from 'body-parser';
import express from 'express';
import Controller from './lib/ControllerInterface';
import loadControllers from './lib/loadControllers';
import { errorMiddleware } from './lib/PxpError';
import passport from 'passport';
import { authRouter } from './auth/auth-routes';
import { configPassport } from './auth/config';
import session from 'express-session';
import { getConnection } from 'typeorm';
import { Session } from './modules/pxp/entity/Session';
import { TypeormStore } from 'typeorm-store';
class App {
  public app: express.Application;
  public controllers: Controller[];

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.controllers = [];
    // this.loadControllers()
    //   .then(() => {
    //     return this.connectToTheDatabase();
    //   })
    this.connectToTheDatabase()
      .then((resp) => {
        this.initializeSession();
        this.initializePassport();
        // this.initializeErrorHandling();
        console.log('depandencias loaded');
      })
      .catch((err) => console.log(err));
  }
  public async loadControllers(): Promise<void> {
    this.controllers = await loadControllers();
    this.initializeRoutes();
  }
  public listen(): void {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializePassport() {
    configPassport();
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.app.use((req, res, next) => {
      console.log(req.session);
      console.log(req.user);
      next();
    });
    console.log('[AUTH]', authRouter);

    this.app.use(authRouter);
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
    // console.log('load routes', this.controllers);
    this.controllers.forEach((controller) => {
      console.log(controller.router);

      this.app.use(controller.router);
    });
  }

  private connectToTheDatabase() {
    console.log('create connections');
    return createConnections([
      {
        name: String('default'),
        type: 'postgres',
        host: String(process.env.PG_HOST),
        port: Number(process.env.PG_PORT),
        username: String(process.env.PG_USER),
        password: String(process.env.PG_PASSWORD),
        database: String(process.env.PG_DATABASE),
        entities: [__dirname + '/modules/**/entity/*.js']
      },
      {
        name: String('log'),
        type: 'postgres',
        host: String(process.env.PG_HOST),
        port: Number(process.env.PG_PORT),
        username: String(process.env.PG_USER),
        password: String(process.env.PG_PASSWORD),
        database: String(process.env.PG_DATABASE)
      }
    ]);
  }
}

export default App;
