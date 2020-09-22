import passport from 'passport';
import { OAuth2Strategy, Profile } from 'passport-google-oauth';
import { UserRepository } from '../../modules/pxp/repositories/user.repository';
import { getCustomRepository } from 'typeorm';
import User from 'modules/pxp/entity/User';

const googleStrategy = new OAuth2Strategy(
  {
    clientID: String(process.env.GOOGLE_CLIENT_ID),
    clientSecret: String(process.env.GOOGLE_SECRET_ID),
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken: string, refreshToken: string, profile: Profile, done) => {
    console.log('PROFILE', profile);
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
        console.log('[USER]', user);

        return done(null, user);
      })
      .catch((err) => {
        console.log('[ERROR]', err);

        done(err);
      });
  }
);

export const configGoogleStrategy = () => {
  passport.use(googleStrategy);
};
