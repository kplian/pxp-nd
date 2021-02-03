import { NextFunction, Response } from 'express';

export const isReportMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
): void => {

  if (req.query.report) {
    delete req.query.start;
    delete req.query.limit;
    req.report = JSON.parse(req.query.report);
    delete req.query.report;
  }
  next();
};