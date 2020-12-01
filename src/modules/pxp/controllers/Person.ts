/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Person Controller
 *
 * @summary Person Controller
 * @author Jaime Rivera
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-11-02 11:58:05
 */
import { EntityManager } from 'typeorm';
import { Controller, Get, Post, DbSettings, ReadOnly, Log, Model, __ } from '../../../lib/pxp';
import PersonModel from '../entity/Person';


@Model('pxp/Person')
class Person extends Controller {
  /*@Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async list(params: Record<string, unknown>): Promise<unknown> {
    const listParam = this.getListParams(params);
    const [persons, count] = await __(PersonModel.findAndCount(listParam)) as unknown[];
    return { data: persons, count };
  }*/

  @Post()
  @DbSettings('Orm')
  @ReadOnly(false)
  @Log(true)
  async add(params: Record<string, unknown>, manager: EntityManager): Promise<PersonModel> {
    const person = new PersonModel();
    Object.assign(person, params);
    person.createdBy = (this.user.username as string);
    await __(this.classValidate(person));
    await manager.save(person);
    return person;
  }
}

export default Person;
