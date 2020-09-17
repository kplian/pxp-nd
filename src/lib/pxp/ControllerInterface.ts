/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Structure for all controllers.
 *
 * @summary Structure for all controllers.
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:28:21
 */
import { Router } from 'express';

interface ControllerInterface {
  path: string;
  router: Router;
}

export { ControllerInterface };