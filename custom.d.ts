declare namespace Express {
  export interface Request {
    start?: Date
  }

  export interface Response {
    logId?: number
  }
}