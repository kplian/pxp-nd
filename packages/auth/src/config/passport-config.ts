/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Import all auth configs
 *
 * @summary Import all auth configs
 * @author Israel Colque
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:43:59
 */
import { configPassportLocal } from './passport-local';
import { configFacebookStrategy } from './passport-facebook';
import { configGoogleStrategy } from './passport-google';
import { configPassportJwtStrategy } from './passport-jwt';
import { lstatSync, readdirSync, existsSync} from 'fs';
import { NextFunction, Response, Request } from 'express';
import path from 'path';

const isDirectory = (source: string) => lstatSync(source).isDirectory()
const modulesFolder = process.cwd() + '/dist/modules';

export const getRoutesAuth = () => {
  return readdirSync(modulesFolder)
    .filter(name => name !== 'pxp')
    .map(name =>path.join(modulesFolder, name))
    .filter(isDirectory)
    .filter(module =>{
      const authDir = path.join(module, 'auth');
      const authFile = path.join(authDir, 'auth.js');
      return existsSync(authDir) ? isDirectory(authDir) && existsSync(authFile) : false;
    });
}



const getCustomStrategies = () => {
  getRoutesAuth()
    .forEach(module =>{
      const authFile = path.join(module, 'auth', 'auth.js');

      import(authFile).then( authCustom =>{
        authCustom.strategies.forEach( (stg:any) => stg());
      });
  });
};



export const configPassport = (): void => {
  getCustomStrategies();
  configPassportJwtStrategy();
  configGoogleStrategy();
  configFacebookStrategy();
  setTimeout(() => configPassportLocal());
};


/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send({
    error: true,
    message: 'Not Authorized'
  });
};