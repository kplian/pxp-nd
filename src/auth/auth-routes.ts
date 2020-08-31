import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserRepository } from '../modules/pxp/repository/User';
import { getCustomRepository } from 'typeorm';
import { isAuthenticated } from './config/passport-local';

const authRouter = Router();

authRouter.post(
  '/auth/login',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err, user, info) => {
      console.log(err, user, info);
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(400)
          .send({ message: 'Invalid username or password' });
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

authRouter.get('/auth/guard', isAuthenticated, (req, res, next) => {
  res.status(200).send({
    message: 'RUOTE GUARD'
  });
});

authRouter.get('/auth/logout', (req, res, next) => {
  req.logout();
  res.status(200).send({
    message: 'Logout correct'
  });
});

//** GOOGLE */
authRouter.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login']
  })
);

authRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  function (req, res) {
    console.log('res');

    res.redirect('/');
  }
);

/** FACEBOOK */
authRouter.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: 'read_stream' })
);

authRouter.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
  function (req, res) {
    console.log('res facebook');

    res.redirect('/');
  }
);
export { authRouter };
