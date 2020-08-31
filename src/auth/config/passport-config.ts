import { configPassportLocal } from './passport-local';
import { configFacebookStrategy } from './passport-facebook';
import { configGoogleStrategy } from './passport-google';

export const configPassport = () => {
  configPassportLocal();
  configGoogleStrategy();
  configFacebookStrategy();
};
