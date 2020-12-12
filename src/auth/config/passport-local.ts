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
import User from 'modules/pxp/entity/User';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../../modules/pxp/repositories/user.repository';
import { NextFunction, Response, Request } from 'express';

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
  userRepository
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
    .then((user) => {
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
    .catch((err) => {
      done(err);
    });
};

function configPassportLocal(): void {
  const strategy = new LocalStrategy(customFields, verifyCallback);
  passport.use(strategy);
  // This method is used to store the user identifier locally.
  passport.serializeUser((user: User, done: any) => {
    done(null, user.userId);
  });
  // This method is used to extract user data.
  passport.deserializeUser((userId: string, done: any) => {
    const userRepository = getCustomRepository(UserRepository);


    userRepository.createQueryBuilder('user')
      //.leftJoinAndSelect('role.uis', 'ui')
      .leftJoinAndSelect('user.roles', 'role', 'role.roleId = 1')
      .where('"user".user_id = :id', { id: userId })
      .getOne()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => done(err));
  });
}

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send({
    error: true,
    message: 'Not Authorized'
  });
};

export { configPassportLocal };
