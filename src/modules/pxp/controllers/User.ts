import express from 'express';
import { getManager } from 'typeorm';
import { __ } from '../../../lib/PxpError';
import Controller, { Get, Route, Post } from '../../../lib/Controller';
import { User as UserModel } from '../entity/User';
import { genPassword } from '../../../auth/utils/password';

@Route('/user')
//@StoredProcedure('')
class User extends Controller {
  @Get()
  async getAll(
    request: express.Request,
    response: express.Response
  ): Promise<void> {
    const users = await __(getManager().find(UserModel));
    response.send(users);
  }

  @Post()
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
    // user.firstName = 'Timber';
    // user.lastName = 'Saw';
    // user.isActive = true;
    await __(getManager().save(user));
    response.json(user);
  }
}

export default User;
