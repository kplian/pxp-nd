import passport from 'passport';
import * as passportFirebase from 'passport-firebase-auth';
import firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";

export const customFirebaseInitialize = (credentials: any, databaseURL: string = '' ) => {
  firebase.initializeApp({
    credential: credentials,
    databaseURL,
  });

   firebase.auth().signInWithEmailAndPassword('Dalton.thiel@yahoo.com','12345678').then((resp:any) => {
      console.log(resp);
      
    });
  return firebase;
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
