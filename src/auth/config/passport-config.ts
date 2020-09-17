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

export const configPassport = (): void => {
  configPassportLocal();
  configPassportJwtStrategy();
  configGoogleStrategy();
  configFacebookStrategy();
};
