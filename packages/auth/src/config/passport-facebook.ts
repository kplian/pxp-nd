/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Facebook config
 *
 * @summary Facebook config
 * @author Israel Colque
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:44:52
 */
import passport from 'passport';
import { Strategy, Profile, VerifyFunction } from 'passport-facebook';
import { UserRepository } from '@pxp-nd/repositories';
import { getCustomRepository } from 'typeorm';
import {User} from '@pxp-nd/entities';

const facebookStrategy = new Strategy(
  {
    clientID: String(process.env.FACE_CLIENT_ID),
    clientSecret: String(process.env.FACE_SECRET_ID),
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  (accessToken: string, refreshToken: string, profile: Profile, done) => {
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
      .catch((err: any) => done(err));
  }
);

export const configFacebookStrategy = (): void => {
  passport.use(facebookStrategy);
};
