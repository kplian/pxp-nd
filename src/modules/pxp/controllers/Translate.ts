/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * User Controller
 *
 * @summary User Controller
 * @author Israel Cm
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-09-17 19:04:30
 */
import { getManager } from 'typeorm';
import {
  Controller,
  Get,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model
} from '../../../lib/pxp';
import UserModel from '../entity/User';


@Route('/translate/translations')
@Model('pxp/Translate')
class Translate extends Controller {

}

export default Translate;
