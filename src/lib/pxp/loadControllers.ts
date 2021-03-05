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
import { ControllerInterface as Controller } from './index';

const readdir = util.promisify(fs.readdir);
export default async (): Promise<Controller[]> => {
  const modulesPath = `${__dirname}/../../modules`;
  let modules: string[] = [];
  const controllers: Controller[] = [];
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
      controllers.push(new ControllerClass.default(controllerFile.module));
    }

  } catch (err) {
    console.log(err);
  }
  return controllers;

};