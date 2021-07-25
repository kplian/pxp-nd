import { Router, Request, Response, NextFunction } from 'express';
import { makePdf } from './pdf';
// import { makeCsv } from './csv';
import { makeXlsx } from './xlsx';
import { generateReport, listReports, getReport, listGroup } from './generated';
import { isAuthenticated } from '@pxp-nd/auth';
import { IConfigPxpApp } from '../../interfaces';


const getReportsRouter = (config: IConfigPxpApp ) => {
  const reportsRouter = Router();
  const prefix = config.apiPrefix;

  reportsRouter.post(prefix + '/pdf', makePdf);
  reportsRouter.get(prefix + '/pdf', makePdf);
  // reportsRouter.get(prefix + '/csv', makeCsv);
  reportsRouter.get(prefix + '/xlsx', makeXlsx);
  reportsRouter.get(prefix + '/reports/groups', [isAuthenticated] ,listGroup);
  reportsRouter.get(prefix + '/reports/:groupId', [isAuthenticated] ,listReports);
  reportsRouter.get(prefix + '/reports/:id/data', [isAuthenticated] ,getReport);
  reportsRouter.get(prefix + '/reports/:id/generate', [isAuthenticated] ,generateReport);
  reportsRouter.get(prefix + '/reports/:id/generate/:type', [isAuthenticated] ,generateReport);
  return reportsRouter;
}
export { getReportsRouter };
