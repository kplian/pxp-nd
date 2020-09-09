import { getManager } from 'typeorm';
import Controller, { Get, Post, DbSettings, ReadOnly, Authentication, Log, Model } from '../../../lib/Controller';
import PersonModel from '../entity/Person';

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
  @Authentication(false)
  @Log(false)
  async add(params: Record<string, unknown>): Promise<PersonModel> {
    console.log('llega');
    const person = new PersonModel();
    person.name = <string>params['name'];
    person.lastName = <string>params['last_name_first'];
    person.dni = <string>params['dni'];
    person.dniNumber = <string>params['dni_number'];
    person.createdBy = <number>this.user.userId;
    await person.save();
    return person;
  }
}

export default Person;
