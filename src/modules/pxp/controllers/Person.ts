import { EntityManager } from 'typeorm';
import Controller, { Get, Post, DbSettings, ReadOnly, Authentication, Log, Model } from '../../../lib/Controller';
import PersonModel from '../entity/Person';
import { PxpError } from '../../../lib/PxpError';

@Model('pxp/Person')
class Person extends Controller {
  @Get()
  @DbSettings('Orm')
  @Authentication(true)
  @ReadOnly(true)
  async list(params: Record<string, unknown>): Promise<PersonModel[]> {
    const listParam = this.getListParams(params);
    const persons = await PersonModel.find(listParam);
    return persons;
  }

  @Post()
  @DbSettings('Orm')
  @ReadOnly(false)
  @Log(true)
  async add(params: Record<string, unknown>, entityManager: EntityManager): Promise<PersonModel> {
    const person = new PersonModel();
    person.name = <string>params['name'];
    person.lastName = <string>params['lastName'];
    person.dni = <string>params['dni'];
    person.dniNumber = <string>params['dniNumber'];
    person.createdBy = <number>this.user.userId;
    await entityManager.save(person);
    return person;
  }
}

export default Person;
