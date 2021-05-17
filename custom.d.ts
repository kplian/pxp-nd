declare namespace Express {
  export interface Request {
    start?: Date
  }

  export interface Response {
    logId?: number
  }
}

declare module 'passport-firebase-auth';
declare module 'form-data';