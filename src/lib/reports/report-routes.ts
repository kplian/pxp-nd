import { Router, Request, Response, NextFunction } from 'express';
import { makePdf } from './pdf';
import { makeCsv } from './csv';
import { makeXlsx } from './xlsx';
import config from '../../config'
import { generateReport, listReports, getReport } from './generated';
import { isAuthenticated } from '../../auth/config/passport-local';
const reportsRouter = Router();
const prefix = config.apiPrefix;

reportsRouter.post(prefix + '/pdf', makePdf);
reportsRouter.get(prefix + '/pdf', makePdf);
reportsRouter.get(prefix + '/csv', makeCsv);
reportsRouter.get(prefix + '/xlsx', makeXlsx);
reportsRouter.get(prefix + '/reports/:groupId', [isAuthenticated] ,listReports);
reportsRouter.get(prefix + '/reports/:id/data', [isAuthenticated] ,getReport);
reportsRouter.get(prefix + '/reports/:id/generate', [isAuthenticated] ,generateReport);
reportsRouter.get(prefix + '/reports/:id/generate/:type', [isAuthenticated] ,generateReport);

export { reportsRouter };
