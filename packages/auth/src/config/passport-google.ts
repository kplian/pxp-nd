/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Google config
 *
 * @summary Google config
 * @author Israel Colque
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:46:00
 */
import passport from 'passport';
import { OAuth2Strategy, Profile } from 'passport-google-oauth';
import { UserRepository } from '@pxp-nd/repositories';
import { getCustomRepository } from 'typeorm';
import { User } from '@pxp-nd/common';

const googleStrategy = new OAuth2Strategy(
  {
    clientID: String(process.env.GOOGLE_CLIENT_ID),
    clientSecret: String(process.env.GOOGLE_SECRET_ID),
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
    const UserRepo = getCustomRepository(UserRepository);
    UserRepo.findOrCreateSocial(
      {
        autentification_id: profile.id,
        autentification_type: 'google'
      },
      {
        username: profile.emails ? profile.emails[0].value : profile.id,
        authenticationId: profile.id,
        authenticationType: 'google'
      }
    )
      .then((user: User) => {
        return done(null, user);
      })
      .catch((err: any) => {
        done(err);
      });
  }
);

export const configGoogleStrategy = (): void => {
  passport.use(googleStrategy);
};
