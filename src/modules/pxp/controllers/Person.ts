import { EntityManager } from 'typeorm';
import { validate } from 'class-validator';
import Controller, { Get, Post, DbSettings, ReadOnly, Log, Model, Authentication } from '../../../lib/Controller';
import PersonModel from '../entity/Person';
import { PxpError, __ } from '../../../lib/PxpError';

@Model('pxp/Person')
class Person extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async list(params: Record<string, unknown>): Promise<unknown> {
    const listParam = this.getListParams(params);
    const [persons, count] = await __(PersonModel.findAndCount(listParam)) as unknown[];
    return { data: persons, count };
  }

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
