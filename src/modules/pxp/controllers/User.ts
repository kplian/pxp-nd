import { getManager } from 'typeorm';
import Controller, {
  Get,
  Route,
  Post,
  StoredProcedure,
  DbSettings,
  ReadOnly,
  Model
} from '../../../lib/Controller';
import UserModel from '../entity/User';
import { genPassword } from '../../../auth/utils/password';

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
