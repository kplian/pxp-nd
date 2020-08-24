import fs from 'fs';
import util from 'util';
import Controller from './ControllerInterface';

const readdir = util.promisify(fs.readdir);
export default async (): Promise<Controller[]> => {
  const modulesPath = `${__dirname}/../modules`;
  let modules: string[] = [];
  const controllers: Controller[] = [];
  let controllerFiles: Record<string, string>[] = [];
  let auxFiles: Record<string, string>[] = [];
  try {
    modules = await readdir(modulesPath);
    for (let i = 0; i < modules.length; i++) {
      const files = await readdir(modulesPath + '/' + modules[i] + '/controllers');
      auxFiles = files.map(j => ({
        url: modulesPath + '/' + modules[i] + '/controllers/' + j,
        module: modules[i]
      }));
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