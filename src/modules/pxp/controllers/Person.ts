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
    const person = new PersonModel();
    person.name = (params.name as string);
    person.lastName = (params.last_name_first as string);
    person.dni = (params.dni as string);
    person.dniNumber = (params.dni_number as string);
    person.createdBy = (this.user.userId as number);
    await person.save();
    return person;
  }
}

export default Person;
