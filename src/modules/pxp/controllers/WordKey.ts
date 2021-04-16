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
import { group } from 'console';
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
import WordKeyModel from '../entity/WordKey';


@Route('/translate/words')
@Model('pxp/WordKey')
class WordKey extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async list(params: Record<string, unknown>): Promise<any> {
    const [data, count] = await getManager().findAndCount(WordKeyModel, {
      ...params,
      relations: ['group']
    });

    const parseData = data.map(item => ({ ...item, groupName: item.group? item.group.name: ''}))
    return { data: parseData, count };
  }

}

export default WordKey;
