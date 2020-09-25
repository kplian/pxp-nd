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
import { getManager } from 'typeorm';
import {
  Controller,
  Get,
  Route,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model
} from '../../../lib/pxp';
import UserModel from '../entity/User';


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

  /*@Post()
  async add(
    request: express.Request,
    response: express.Response
  ): Promise<void> {
    const user = new UserModel();
    const saltHash = genPassword('12345678');
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    user.hash = hash;
    user.salt = salt;
    user.username = 'gato';
    // user.login = 'juan.perez';
    // user.password = 'Juan123';
    // user.token = 'ABCD123';

    await getManager().save(user);
    response.json(user);
  }*/
  /*
    @Post()
    async add(request: express.Request, response: express.Response): Promise<void> {
      const user = new UserModel();
      user.firstName = "Timber";
      user.lastName = "Saw";
      user.isActive = true;
      await __(getManager().save(user));
      response.json(user);
    }*/
}

export default User;
