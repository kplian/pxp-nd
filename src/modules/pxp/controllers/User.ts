/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * User Controller
 *
 * @summary User Controller
 * @author Jaime Rivera
 *
 * Created at     : 2020-09-17 18:55:38
 * Last modified  : 2020-09-17 19:04:30
 */
import { EntityManager, } from 'typeorm';
import { getManager } from 'typeorm';
import {
  Controller,
  Get,
  Post,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model,
  __
} from '../../../lib/pxp';
import { genPassword } from '../../../auth/utils/password'
import UserModel from '../entity/User';
import Person from '../entity/Person';
import Role from '../entity/Role';
import has = Reflect.has;


@Route('/user')
@StoredProcedure('pxp.ftusuario')
@Model('pxp/User')
class User extends Controller {
  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async getAll(params: Record<string, unknown>): Promise<UserModel[]> {
    const users = await getManager().find(UserModel);
    return users;
  }

  @Post()
  @ReadOnly(false)
  async addAdminUser(params: Record<string, unknown>, manager: EntityManager): Promise<any> {
    const person = new Person();
    person.name = params.name as string;
    person.lastName = params.lastName as string;
    person.createdBy = 'admin';
    await __(manager.save(person));

    const  role = await __(Role.findOne({
      role: 'admin'
    }));

    const user = new UserModel();
    user.person = person;
    user.username = params.username as string;
    const hashSalt = genPassword(params.password as string);
    user.hash = hashSalt.hash;
    user.salt = hashSalt.salt;
    user.createdBy = 'admin';
    user.roles = [role];
    const userResult = await __(manager.save(user));
    return { userId: userResult.userId };
  }

  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async genPassword(params: Record<string, unknown>): Promise<UserModel[]> {
    const hashSalt = genPassword(params.password as string);

    return hashSalt;

  }

}

export default User;
