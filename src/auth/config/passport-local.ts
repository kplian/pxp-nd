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
) => {
  const userRepository = getCustomRepository(UserRepository);

  userRepository
    .findOne({
      where: {
        username
      }
    })
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      const isValid = true; //jrr validPassword(password, user.hash, user.salt);

      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch((err) => {
      done(err);
    });
};

function configPassportLocal() {
  const strategy = new LocalStrategy(customFields, verifyCallback);
  passport.use(strategy);
  // This method is used to store the user identifier locally.
  passport.serializeUser((user: User, done: any) => {
    done(null, user.userId);
  });
  // This method is used to extract user data.
  passport.deserializeUser((userId: string, done: any) => {
    const userRepository = getCustomRepository(UserRepository);

    userRepository
      .findOne({
        where: {
          user_id: userId
        }
      })
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
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send({ message: 'Not Authorized' });
};

export { configPassportLocal };
