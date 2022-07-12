export { genPassword } from './utils/password';
export { isAuthenticated } from './config';
import { getAuthRoutes , customAuthRoutes } from './auth-routes';
import { configPassport, issueJWT } from './config';

export const configAuth = () => {
  return {
    configPassport,
    getAuthRoutes,
    customAuthRoutes,
    issueJWT
  }
}
