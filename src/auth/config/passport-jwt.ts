import { Strategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import { UserRepository } from '../../modules/pxp/repository/User';
import { getCustomRepository } from 'typeorm';
import User from 'modules/pxp/entity/User';
// import * as jwt from 'jsonwebtoken';
import { sign, verify } from 'jsonwebtoken';
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: String(process.env.SECRET),
  algorithms: ['HS256']
};

// app.js will pass the global passport object here, and this function will configure it
export const configPassportJwtStrategy = () => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new Strategy(options, function (jwt_payload, done) {
      // We will assign the `sub` property on the JWT to the database ID of user
      const UserRepo = getCustomRepository(UserRepository);
      UserRepo.findOne({
        where: {
          id: jwt_payload.sub
        }
      })
        .then((user) => {
          if (user) {
            done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => done(err, false));
    })
  );
};

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the User ID
 */
export function issueJWT(user: User) {
  const id = user.userId;

  const expiresIn = '1d';
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
