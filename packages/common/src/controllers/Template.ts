/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Person Controller
 *
 * @summary Account Status Type Controller
 * @author Favio Figueroa
 *
 * Created at     : 2021-03-10 18:55:38
 * Last modified  :
 */
import { EntityManager } from 'typeorm';

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Authentication,
  Permission,
  Model, __, Log
} from '@pxp-nd/core';

import {Template as TemplateModel} from '../entities';

@Model('common/Template')
class Template extends Controller {

  @Post()
  @DbSettings('Orm')
  @ReadOnly(false)
  @Log(true)
  //@Authentication(false)
  async add(params: Record<string, unknown>, manager: EntityManager): Promise<unknown> {
    console.log('llega',params)
    const template = new TemplateModel();
    Object.assign(template, params);
    template.createdBy = 'admin';
    await __(this.classValidate(template));
    await manager.save(template);
    return { ...template, mode: 'add'};
  }


}

export default Template;
