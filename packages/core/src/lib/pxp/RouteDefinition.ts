/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Route definition interface
 *
 * @summary Route definition interface
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:13:52
 */

export enum Method {
    get = 'get',
    post = 'post',
    delete = 'delete',
    options = 'options',
    put = 'put',
    patch = 'patch',
}; 
export interface RouteDefinition {
  // Path to our route
  path: string;
  // HTTP Request method (get, post, ...)
  requestMethod: Method;
  // Method name within our class responsible for this route
  methodName: string;
}