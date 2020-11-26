/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Authentication Routes
 *
 * @summary Authentication Routes.
 * @author Israel Colque
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-10-09 09:53:26
 */
import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { isAuthenticated, verifyCallback } from './config/passport-local';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../modules/pxp/repositories/user.repository';
import { validPassword } from './utils/password';
import { issueJWT } from './config/passport-jwt';
import config from '../config';

const authRouter = Router();
authRouter.post(
  config.apiPrefix + '/auth/login',
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(400)
          .send({
            error: true,
            message: info
          });
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        // const tokenObject = issueJWT(user);
        return res.status(200).send(user);
      });
    })(req, res, next);
  }
);

authRouter.post(config.apiPrefix + '/auth/login/token', (req, res, next) => {
  const userRepo = getCustomRepository(UserRepository);
  userRepo
    .findOne({
      where: {
        username: req.body.username
      }
    })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .send({ message: 'Invalid username or password' });
      }
      const isValid = validPassword(
        req.body.password,
        String(user.hash),
        String(user.salt)
      );

      console.log('user', isValid);
      if (isValid) {
        console.log('token', user);
        const tokenObject = issueJWT(user);

        return res.status(200).send({
          success: true,
          token: tokenObject.token,
          expiresIn: tokenObject.expires
        });
      } else {
        console.log('user error', isValid);

        return res
          .status(400)
          .send({ message: 'Invalid username or password' });
      }
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
});

authRouter.get(config.apiPrefix + '/auth/guard', isAuthenticated, (req, res, next) => {
  res.status(200).send({
    message: 'RUOTE GUARD'
  });
});

authRouter.post(config.apiPrefix + '/auth/logout', (req, res, next) => {
  req.logout();
  res.status(200).send({
    message: 'Logout correct'
  });
});

//** GOOGLE */
authRouter.get(
  config.apiPrefix + '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  })
);

authRouter.get(
  config.apiPrefix + '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  function (req, res) {
    res.status(200).send(req.user);
  }
);

/** FACEBOOK */
authRouter.get(
  config.apiPrefix + '/auth/facebook',
  passport.authenticate('facebook', { scope: ['read_stream', 'email'] })
);

authRouter.get(
  config.apiPrefix + '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
  function (req, res) {
    console.log('res facebook');

    res.redirect('/');
  }
);
export { authRouter };
