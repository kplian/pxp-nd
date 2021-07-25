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
import { EntityManager, getManager } from 'typeorm';
import {
  Controller,
  Get,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model
} from '@pxp-nd/core';
import {WordKey as WordKeyModel} from '@pxp-nd/entities';
@Route('/translate/words')
@Model('common/WordKey')
class WordKey extends Controller {

  @Get('/add')
  @DbSettings('Orm')
  @ReadOnly(false)
  async add(params: any, manager: EntityManager) {
    const wordKey = await manager.save(WordKeyModel, {
      ...params
    });
    return wordKey;
  }
  
  @Get('/group/:groupId')
  @DbSettings('Orm')
  @ReadOnly(false)
  async findById(params: any, manager: EntityManager) {
    const [data, count] = await manager.findAndCount(WordKeyModel, {
      where: {
        translationGroupId: params.groupId,
      },
      relations: ['group']
    });

    return {data, count};
  }

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
