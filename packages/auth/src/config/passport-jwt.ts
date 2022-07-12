/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Jwt config
 *
 * @summary Jwt config
 * @author Israel Colque
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:46:18
 */
import { Strategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import passport from 'passport';
import { getRepository } from 'typeorm';
import {User} from '@pxp-nd/common';
// import * as jwt from 'jsonwebtoken';
import { sign, verify } from 'jsonwebtoken';
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: String(process.env.SECRET),
  algorithms: ['HS256']
};

// app.js will pass the global passport object here, and this function will configure it
export const configPassportJwtStrategy = (
  verifyUser = verifyUserJwt, 
) => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new Strategy(options, function (jwt_payload, done) {
      // We will assign the `sub` property on the JWT to the database ID of user
      verifyUser(jwt_payload.sub, done);
    })
  );
};

function verifyUserJwt(id: number | string, done: VerifyCallback) {
  const UserRepo: any = getRepository(User);
  UserRepo.findOne({
    where: {
      userId: id,
    },
  })
    .then((user: any) => {
      if (user) {
        done(null, user);
      } else {
        return done(null, null);
      }
    })
    .catch((err: any) => done(err, null));
}

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the User ID
 */
export function issueJWT(user: User, expiresIn= '1d') {
  const id = user.userId;
  const secret = String(process.env.SECRET);

  const payload = {
    sub: id,
    iat: Date.now()
  };

  const signedToken = sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256'
  });

  return {
    token: 'Bearer ' + signedToken,
    expires: expiresIn
  };
}
