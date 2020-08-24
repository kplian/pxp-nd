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
import loadControllers from './lib/loadControllers'
import { errorMiddleware } from './lib/PxpError';

class App {
  public app: express.Application;
  public controllers: Controller[];

  constructor() {
    this.app = express();
    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.controllers = [];
    this.initializeErrorHandling();
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
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeRoutes() {
    console.log('load routes', this.controllers);
    this.controllers.forEach((controller) => {

      this.app.use('/', controller.router);
    });
  }

  private connectToTheDatabase() {
    console.log('create connections');
    createConnections([{
      name: String('default'),
      type: 'postgres',
      host: String(process.env.PG_HOST),
      port: Number(process.env.PG_PORT),
      username: String(process.env.PG_USER),
      password: String(process.env.PG_PASSWORD),
      database: String(process.env.PG_DATABASE),
      entities: [
        __dirname + "/modules/**/entity/*.js"
      ],
    }, {
      name: String('log'),
      type: 'postgres',
      host: String(process.env.PG_HOST),
      port: Number(process.env.PG_PORT),
      username: String(process.env.PG_USER),
      password: String(process.env.PG_PASSWORD),
      database: String(process.env.PG_DATABASE),
    }]);
  }
}

export default App;
