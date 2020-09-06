import { configPassportLocal } from './passport-local';
import { configFacebookStrategy } from './passport-facebook';
import { configGoogleStrategy } from './passport-google';
import { configPassportJwtStrategy } from './passport-jwt';

export const configPassport = () => {
  configPassportLocal();
  configPassportJwtStrategy();
  configGoogleStrategy();
  configFacebookStrategy();
};
