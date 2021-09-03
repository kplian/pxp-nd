/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Automatically load all controllers
 *
 * @summary Automatically load all controllers
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-10-04 19:04:18
 */
import fs from 'fs';
import util from 'util';
import path from 'path';
import { ControllerInterface as Controller } from './index';
import { IConfigPxpApp } from '../../interfaces';
// import * as controllers from '../../controllers';
const readdir = util.promisify(fs.readdir);

const loadPxpControllers = (config: IConfigPxpApp, io: any) => {
  const controllers: any = [];
  if (config.modules) {
    const modules = Object.keys(config.modules);
    modules.forEach((name: string) => {
      const module = config.modules[name];
      const modControllers = module.controllers ? module.controllers: [];
      modControllers.forEach((ctrl: any) => controllers.push(new ctrl(name, null, config, io)))
    })
  }
  // const pxpControllers: any = controllers;
  return controllers;
  // return  Object.keys(controllers).map((key: any) => new controllers[key]('pxp', config));
};

export default async (config: IConfigPxpApp, io: any): Promise<Controller[]> => {
  // const modulesPath = `${__dirname}/../../modules`;
  const modulesPath = path.join( process.cwd(), `/dist/modules`);
  let modules: string[] = [];
  const controllers: Controller[] = loadPxpControllers(config, io);
  let controllerFiles: Record<string, string>[] = [];
  let auxFiles: Record<string, string>[] = [];
  try {
    modules = await readdir(modulesPath);
    for (const module of modules) {
      const files = await readdir(modulesPath + '/' + module + '/controllers');
      // this adds javascript files not ts
      auxFiles = files.reduce((result: Record<string, string>[], j) => {
        if (!j.includes('.map') && j.includes('.js')) {
          result.push({
            url: modulesPath + '/' + module + '/controllers/' + j,
            module
          });
        }
        return result;
      }, []);
      controllerFiles = [...controllerFiles, ...auxFiles];
    }
    for (const controllerFile of controllerFiles) {
      const ControllerClass = await import(controllerFile.url);
      controllers.push(new ControllerClass.default(controllerFile.module, null, config, io));
    }

  } catch (err) {
    console.log(err);
  }
  return controllers;

};