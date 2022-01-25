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
 * Last modified  : 2020-12-01 11:23:10
 */
import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { isAuthenticated } from './config/passport-config';
import { getRepository } from 'typeorm';
// import { UserRepository } from '@pxp-nd/repositories';
import { User } from '@pxp-nd/common';
import { validPassword } from './utils/password';
import { issueJWT } from './config/passport-jwt';
import { PxpError, errorMiddleware } from '@pxp-nd/core';
import { getRoutesAuth } from './config/passport-config';
import path from 'path';

const getAuthRoutes = (apiPrefix: string ) => {
  const authRouter = Router();
  authRouter.post(
    apiPrefix + '/auth/login',
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          errorMiddleware(err, req, res);
        }

        if (!user) {
          // throw new PxpError(400, info);
          return res.status(400).json({
            message: info,
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

  authRouter.post(apiPrefix + '/auth/login/token', (req, res, next) => {
    // const userRepo = getCustomRepository(UserRepository);
    getRepository(User)
      .findOne({
        where: {
          username: req.body.username
        }
      })
      .then((user: any) => {
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

        if (isValid) {
          let tokenObject;
          if (req.body.expiresIn) {
            tokenObject = issueJWT(user, req.body.expiresIn);
          } else {
            tokenObject = issueJWT(user);
          }

          return res.status(200).send({
            success: true,
            token: tokenObject.token,
            expiresIn: tokenObject.expires
          });
        } else {
          return res
            .status(400)
            .send({ message: 'Invalid username or password' });
        }
      })
      .catch((err:any) => {
        return res.status(400).send(err);
      });
  });

  authRouter.get(apiPrefix + '/auth/guard', isAuthenticated, (req, res, next) => {
    res.status(200).send({
      message: 'RUOTE GUARD'
    });
  });

  authRouter.post(apiPrefix + '/auth/logout', (req, res, next) => {
    req.logout();
    res.status(200).send({
      message: 'Logout correct'
    });
  });

  //** GOOGLE */
  authRouter.get(
    apiPrefix + '/auth/google',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    })
  );

  authRouter.get(
    apiPrefix + '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    function (req, res) {
      res.status(200).send(req.user);
    }
  );

  /** FACEBOOK */
  authRouter.get(
    apiPrefix + '/auth/facebook',
    passport.authenticate('facebook', { scope: ['read_stream', 'email'] })
  );

  authRouter.get(
    apiPrefix + '/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    function (req, res) {
      res.redirect('/');
    }
  );
  return authRouter;
}

const customAuthRoutes = () => {
  const routers: any = [];
  getRoutesAuth()
  .forEach(module =>{
    const authFile = path.join(module, 'auth', 'auth.js');

    routers.push(import(authFile));
  });
  return Promise.all(routers);
}


export { getAuthRoutes , customAuthRoutes};
