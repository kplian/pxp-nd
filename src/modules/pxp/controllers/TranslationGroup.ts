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
import { getManager, EntityManager, getConnection } from 'typeorm';
import {
  Controller,
  Get,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model,
  Authentication
} from '../../../lib/pxp';
import TranslationGroupModel from '../entity/TranslationGroup';
import async from '../../../lib/pxp/loadControllers';
import * as _ from 'lodash';
import { group } from 'console';

@Route('/translate/groups')
@Model('pxp/TranslationGroup')
class TranslationGroup extends Controller {

  @Get('/entities')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(true)
  async listTablesDb(params: any, manager: EntityManager) {
    const connection = getConnection();
    console.log(_.map(connection.entityMetadatas, (item:any) => item.name));
    
    return {
      data: _.map(connection.entityMetadatas, (item:any) =>({ name: item.name}))
    };
  }

  @Get('/entities/:entity/fields')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(true)
  async listEntityColumns(params: any) {
    const connection = getConnection();
    const entity: any = _.find(connection.entityMetadatas, {name: params.entity}) || {};
    let fields = _.map(entity.columns, (item:any) =>({ name: item.propertyName}));
    fields = fields.filter( item => !_.includes(['createdBy', 'userIdAi', 'modifiedBy', 'createdAt', 'modifiedAt'], item.name))
    return {
      data: fields
    };
  }


  @Get('/translate/:language')
  @DbSettings('Orm')
  // @Authentication(false)
  @ReadOnly(false)
  async getJsonLanguage(params: any, manager: EntityManager) {
    const groupInterfaces = await manager.find(TranslationGroupModel, {
      where: {
        type: 'interface',
      },
      relations: ['words']
    });

    return {
      groupInterfaces
    };
  }
}

export default TranslationGroup;
