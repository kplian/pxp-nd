import passport from 'passport';
import * as passportFirebase from 'passport-firebase-auth';
import firebase from "firebase-admin";

export const customFirebaseInitialize = (credentials: any, databaseURL: string = '', name: string = 'default' ) => {
  const app = firebase.initializeApp({
    credential: firebase.credential.cert(credentials),
    databaseURL,
  }, name);
  return app;
}

export const verifyCallback = (
  accessToken: string,
  refreshToken: string,
  decodedToken: any,
  done: any
): void => {
    return done(null, { user: 'firebase'});

};

const configPassportFirebase = (firebaseProjectId: string, authorizationURL: string, callbackURL: string ) => {
  const strategy = new passportFirebase.Strategy({
    firebaseProjectId,
    authorizationURL,
    callbackURL,
  }, verifyCallback);
  passport.use(strategy);
}

export { configPassportFirebase };
