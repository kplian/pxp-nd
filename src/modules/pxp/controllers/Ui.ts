/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Ui Controller
 *
 * @summary Ui Controller
 * @author Jaime Rivera
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-10-06 10:36:44
 */
import Joi from '@hapi/joi';
import { Controller, Get, DbSettings, ReadOnly, Model, __, Permission, Authentication, Log } from '../../../lib/pxp';
import UiModel from '../entity/Ui';
import User from '../entity/User';


@Model('pxp/Ui')
class Ui extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  @Permission(false)
  async list(params: Record<string, unknown>): Promise<unknown> {

    const schema = Joi.object({
      system: Joi.string().min(2).optional(),
      includeSystemRoot: Joi.boolean().default(true),
      folder: Joi.string().min(2).optional(),
    });
    const valParams = await __(this.schemaValidate(schema, params));
    let isAdmin = true;
    let uiList = [] as number[];
    // not admin
    if (this.user.roles.length === 0) {
      isAdmin = false;
      uiList = await __(User.getUis(this.user.userId as number));
    }
    const uis = await __(UiModel.findRecursive(valParams, 1, isAdmin, uiList)) as unknown[];
    return { data: uis };
  }
}

export default Ui;
