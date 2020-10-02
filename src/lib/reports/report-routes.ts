import { Router, Request, Response, NextFunction } from 'express';
import { makePdf } from './pdf';
const reportsRouter = Router();

reportsRouter.post('/api/pdf', makePdf);
reportsRouter.get('/api/pdf', makePdf);

export { reportsRouter };
