import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.post(
  '/api/login',
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

authRouter.get('/api/guard', (req, res, next) => {
  res.status(200).send({
    message: 'RUOTE GUARD'
  });
});

authRouter.get('/api/logout', (req, res, next) => {
  req.logout();
  res.status(200).send({
    message: 'Logout correct'
  });
});
export { authRouter };
