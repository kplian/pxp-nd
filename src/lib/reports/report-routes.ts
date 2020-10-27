import { Router, Request, Response, NextFunction } from 'express';
import { makePdf } from './pdf';
import { makeCsv } from './csv';
import { makeXlsx } from './xlsx';
const reportsRouter = Router();

reportsRouter.post('/api/pdf', makePdf);
reportsRouter.get('/api/pdf', makePdf);
reportsRouter.get('/api/csv', makeCsv);
reportsRouter.get('/api/xlsx', makeXlsx);

export { reportsRouter };
