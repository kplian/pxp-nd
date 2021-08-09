import { Router, Request, Response, NextFunction } from 'express';
import { makePdf } from './pdf';
// import { makeCsv } from './csv';
import { makeXlsx } from './xlsx';
import { generateReport, listReports, getReport, listGroup } from './generated';
import { IConfigPxpApp } from '../../interfaces';


const getReportsRouter = (config: IConfigPxpApp, ReportEnity: any, ReportGroupEntitiy: any ) => {
  const reportsRouter = Router();
  const prefix = config.apiPrefix;
  const middlewares = config.middlewares || [];

  reportsRouter.post(prefix + '/pdf', makePdf);
  reportsRouter.get(prefix + '/pdf', makePdf);
  // reportsRouter.get(prefix + '/csv', makeCsv);
  reportsRouter.get(prefix + '/xlsx', makeXlsx);
  reportsRouter.get(prefix + '/reports/groups', middlewares ,listGroup(ReportGroupEntitiy));
  reportsRouter.get(prefix + '/reports/:groupId', middlewares ,listReports(ReportEnity));
  reportsRouter.get(prefix + '/reports/:id/data', middlewares ,getReport(ReportEnity));
  reportsRouter.get(prefix + '/reports/:id/generate', middlewares ,generateReport(ReportEnity));
  reportsRouter.get(prefix + '/reports/:id/generate/:type', middlewares ,generateReport(ReportEnity));
  return reportsRouter;
}
export { getReportsRouter };
