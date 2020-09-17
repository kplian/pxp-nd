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
 * Last modified  : 2020-09-17 19:17:28
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
    for (let i = 0; i < modules.length; i++) {
      const files = await readdir(modulesPath + '/' + modules[i] + '/controllers');
      //this adds javascript files not ts
      auxFiles = files.reduce((result: Record<string, string>[], j) => {
        if (!j.includes('.map')) {
          result.push({
            url: modulesPath + '/' + modules[i] + '/controllers/' + j,
            module: modules[i]
          });
        }
        return result;
      }, []);
      controllerFiles = [...controllerFiles, ...auxFiles];
    }

    for (let i = 0; i < controllerFiles.length; i++) {
      const ControllerClass = await import(controllerFiles[i].url);
      controllers.push(new ControllerClass.default(controllerFiles[i].module));
    }

  } catch (err) {
    console.log(err);
  }
  return controllers;

};