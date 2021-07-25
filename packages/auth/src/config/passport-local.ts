/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Local config
 *
 * @summary Local config
 * @author Israel Colque
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-12-01 10:57:09
 */
import passport from 'passport';
import * as passportLocal from 'passport-local';
import { validPassword } from '../utils/password';
import { User } from '@pxp-nd/common';
import { getCustomRepository, getRepository } from 'typeorm';
import { UserRepository } from '@pxp-nd/repositories';


const LocalStrategy = passportLocal.Strategy;
const customFields = {
  usernameField: 'username',
  passwordField: 'password'
};

export const verifyCallback = (
  username: string,
  password: string,
  done: any
): void => {
  const userRepository = getCustomRepository(UserRepository);

  /*
  {
        select: ['username', 'userId', 'person', 'authenticationType', 'style', 'hash', 'salt'],
        where: {
          username
        }
      }*/
  getRepository(User)
    .createQueryBuilder('user')
    .innerJoin('user.person', 'person')
    .select([
      'user.userId',
      'user.username',
      'user.authenticationType',
      'user.style',
      'user.hash',
      'user.salt',
      'person.name',
      'person.lastName',
      'person.lastName2',
      'person.mail',
    ])
    .where('user.username = :name', { name: username })
    .getOne()
    .then((user:any) => {
      if (!user) {
        return done(null, false, 'Invalid username or password');
      }
      const isValid = validPassword(password, <string>user.hash, <string>user.salt);
      delete user.hash;
      delete user.salt;
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false, 'Invalid username or password');
      }
    })
    .catch((err: any) => {
      done(err);
    });
};
function serializeUser(user: any, done: any) {
    done(null, user.userId);
}

function deserializeUser(userId: string, done: any)  {

    const userRepository = getCustomRepository(UserRepository);


    getRepository(User).createQueryBuilder('user')
      //.leftJoinAndSelect('role.uis', 'ui')
      .leftJoinAndSelect('user.roles', 'role', 'role.roleId = 1')
      .where('user.userId = :id', { id: userId })
      .getOne()
      .then((user:any) => {
        done(null, user);
      })
      .catch((err:any) => done(err));
};

function configPassportLocal(
  fields: any = customFields, 
  verifyCb: any = verifyCallback, 
  serializeUs: any = serializeUser, 
  deserializeUs: any = deserializeUser,
): void {
  const strategy = new LocalStrategy(fields, verifyCb);
  passport.use(strategy);
  // This method is used to store the user identifier locally.
  passport.serializeUser(serializeUs);
  // This method is used to extract user data.
  passport.deserializeUser(deserializeUs);
}
export { configPassportLocal };
