import { NextFunction, Response } from 'express';

export const isReportMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
): void => {

  if (req.query.report) {
    delete req.query.start; //TODO 20211011: change for spread operator instead of delete
    delete req.query.limit;
    req.report = JSON.parse(req.query.report);
    delete req.query.report;
  }
  next();
};