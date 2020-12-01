import { Router, Request, Response, NextFunction } from 'express';
import { makePdf } from './pdf';
import { makeCsv } from './csv';
import { makeXlsx } from './xlsx';
import config from '../../config'
const reportsRouter = Router();
const prefix = config.apiPrefix;

reportsRouter.post(prefix + '/pdf', makePdf);
reportsRouter.get(prefix + '/pdf', makePdf);
reportsRouter.get(prefix + '/csv', makeCsv);
reportsRouter.get(prefix + '/xlsx', makeXlsx);

export { reportsRouter };
