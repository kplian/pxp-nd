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
import { EntityManager, getManager } from 'typeorm';
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
import TranslateModel from '../entity/Translate';
import LanguageModel from '../entity/Language';
import axios from 'axios';
@Route('/translate/words')
@Model('pxp/WordKey')
class WordKey extends Controller {

  @Get('/add')
  @DbSettings('Orm')
  @ReadOnly(false)
  async add(params: any, manager: EntityManager) {
    const wordKey = await manager.save(WordKeyModel, {
      ...params
    });

    if(wordKey) {
      const [langs, countLangs] = await manager.findAndCount(LanguageModel, {where: {isActive: true}});
      const translateUrl = (lang, text) => 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20170606T185752Z.72aa1b413023beed.315f7dfc0e2db9db2038b567c99f1fcd66c32fd9&lang=' + lang + '&text=' + text;

      const translates = langs.map( lang => ({
        text: wordKey.defaultText,
        wordId: wordKey.wordKeyId,
        state: 'AUTO',
        languageId: lang.languageId,
      }));
      await manager.save(TranslateModel, translates);
    }

    console.log(wordKey);
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
