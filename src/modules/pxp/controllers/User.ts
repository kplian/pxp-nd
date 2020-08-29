import express from 'express';
import { getManager } from "typeorm";
import Controller, { Get, Route, Post, StoredProcedure, DbSettings, ReadOnly, Model } from '../../../lib/Controller';
import UserModel from "../entity/User";


@Route('/user')
@StoredProcedure('pxp.ftusuario')
@Model('pxp/User')
class User extends Controller {

  @Get()
  @DbSettings('Orm')
  @ReadOnly(true)
  async getAll(params: Record<string, unknown>): Promise<UserModel[]> {
    const users = await getManager().find(UserModel);
    console.log(users);
    return users;
  }
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