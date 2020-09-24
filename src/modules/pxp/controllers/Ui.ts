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
 * Last modified  : 2020-09-22 09:30:51
 */
import { Controller, Get, DbSettings, ReadOnly, Model, __ } from '../../../lib/pxp';
import UiModel from '../entity/Ui';


@Model('pxp/Ui')
class Ui extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async list(params: Record<string, unknown>): Promise<unknown> {
    const uis = await __(UiModel.findRecursive()) as unknown[];
    return { data: uis };
  }
}

export default Ui;
