import passport from 'passport';
import * as passportLocal from 'passport-local';
import { validPassword } from '../utils/password';
import User from 'modules/pxp/entity/User';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../../modules/pxp/repository/User';
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
    .getOne()
    .then((user) => {
      if (!user) {
        return done(null, false, 'Invalid username');
      }
      const isValid = validPassword(password, <string>user.hash, <string>user.salt);
      delete user.hash;
      delete user.salt;
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false, 'Invalid password');
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
    console.log('serialize');
    done(null, user.userId);
  });
  // This method is used to extract user data.
  passport.deserializeUser((userId: string, done: any) => {
    console.log('deserialize');
    const userRepository = getCustomRepository(UserRepository);
    console.time('Time this');

    userRepository
      .findOne({
        where: {
          userId: userId
        },
        cache: 3600000
      })
      .then((user) => {
        console.timeEnd('Time this');
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
  res.status(401).send({ message: 'Not Authorized' });
};

export { configPassportLocal };
