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
import {Translate as TranslateModel} from '@pxp-nd/entities';


@Route('/translate/translations')
@Model('common/Translate')
class Translate extends Controller {
  @Get('/word/:wordId')
  @DbSettings('Orm')
  @ReadOnly(false)
  async findByLang(params: any, manager: EntityManager) {
    const [data, count] = await manager.findAndCount(TranslateModel, {
      where: {
        wordId: params.wordId,
        // languageId: params.languageId,
      },
      relations: ['language']
    });

    return {data, count};
  }
}

export default Translate;
