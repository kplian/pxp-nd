import { getManager } from 'typeorm';
import Controller, { Get, Post, DbSettings, ReadOnly, Authentication } from '../../../lib/Controller';
import PersonModel from '../entity/Person';


class Person extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  @Authentication(false)
  async getAll(params: Record<string, unknown>): Promise<PersonModel[]> {
    const users = await PersonModel.find();
    return users;
  }

  @Post()
  @DbSettings('Orm')
  @ReadOnly(false)
  async add(params: Record<string, unknown>): Promise<PersonModel> {
    const person = new PersonModel();
    person.name = <string>params['name'];
    person.lastNameFirst = <string>params['last_name_first'];
    person.dni = <string>params['dni'];
    person.dniNumber = <string>params['dni_number'];
    await person.save();
    return person;
  }
}

export default Person;
