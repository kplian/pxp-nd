export { genPassword } from './utils/password';
export { isAuthenticated, issueJWT } from './config';
import { getAuthRoutes , customAuthRoutes } from './auth-routes';
import { configPassport } from './config';

export const configAuth = () => {
  return {
    configPassport,
    getAuthRoutes,
    customAuthRoutes,
  }
}
