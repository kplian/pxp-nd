import passport from 'passport';
import { Strategy, Profile, VerifyFunction } from 'passport-facebook';
import { UserRepository } from '../../modules/pxp/repository/User';
import { getCustomRepository } from 'typeorm';
import User from 'modules/pxp/entity/User';

const facebookStrategy = new Strategy(
  {
    clientID: String(process.env.FACE_CLIENT_ID),
    clientSecret: String(process.env.FACE_SECRET_ID),
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  (accessToken: string, refreshToken: string, profile: Profile, done) => {
    console.log('PROFILE', profile);
    const UserRepo = getCustomRepository(UserRepository);
    UserRepo.findOrCreateSocial(
      {
        authenticationId: profile.id,
        authenticationType: 'google'
      },
      {
        username: profile.emails ? profile.emails[0].value : String(profile.id),
        authenticationId: String(profile.id),
        authenticationType: 'facebook'
      }
    )
      .then((user: User) => {
        return done(null, user);
      })
      .catch((err) => done(err));
  }
);

export const configFacebookStrategy = () => {
  passport.use(facebookStrategy);
};
